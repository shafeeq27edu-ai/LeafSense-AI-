import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, top_k_accuracy_score

# ----------------- Configuration -----------------
MODEL_PATH = "model.h5"          # Update path
LABELS_PATH = "class_labels.json" # Update path
TEST_DIR = "dataset/test"        # Update path
OOD_DIR = "dataset/ood"          # Update path (needs 5 non-plant images)
HISTORY_PATH = "training_history.json" # Assumed context, update path

IMG_SIZE = (224, 224) 
BATCH_SIZE = 32
CONFIDENCE_THRESHOLD = 0.60
REPORT_SAVE_PATH = "models/evaluation_report.json"
# -------------------------------------------------

def load_labels(path):
    if not os.path.exists(path):
        print(f"[Warning] {path} not found.")
        return []
    with open(path, 'r') as f:
        labels = json.load(f)
    print(f"Loaded {len(labels)} classes from {path}.")
    return labels

def load_history(path):
    if not os.path.exists(path):
        print(f"[Warning] {path} not found.")
        return None
    with open(path, 'r') as f:
        return json.load(f)

def format_section(title):
    print("\n" + "="*50)
    print(f" {title.upper()}")
    print("="*50)

def main():
    format_section("Initialization")
    class_labels = load_labels(LABELS_PATH)
    num_classes = len(class_labels) if class_labels else None

    print(f"Loading model from {MODEL_PATH}...")
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Exiting.")
        return
    model = load_model(MODEL_PATH, compile=False)

    print(f"Loading test data from {TEST_DIR}...")
    test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)
    
    if os.path.exists(TEST_DIR):
        test_generator = test_datagen.flow_from_directory(
            TEST_DIR,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            shuffle=False
        )
    else:
        print("Test directory not found. Exiting evaluation.")
        return

    # 1. Training Metrics
    format_section("1. Training Metrics")
    history = load_history(HISTORY_PATH)
    if history:
        epochs = len(history.get('accuracy', []))
        final_acc = history['accuracy'][-1]
        final_val_acc = history['val_accuracy'][-1]
        final_loss = history['loss'][-1]
        final_val_loss = history['val_loss'][-1]
        
        print(f"Final Training Accuracy:   {final_acc:.4f}")
        print(f"Final Validation Accuracy: {final_val_acc:.4f}")
        print(f"Final Training Loss:       {final_loss:.4f}")
        print(f"Final Validation Loss:     {final_val_loss:.4f}")
        print("\nEpoch-wise metrics (last 5 epochs):")
        print("Epoch | Train Acc | Val Acc | Train Loss | Val Loss")
        print("-" * 55)
        start_epoch = max(0, epochs-5)
        for i in range(start_epoch, epochs):
            print(f"{i+1:5d} | {history['accuracy'][i]:.4f}    | {history['val_accuracy'][i]:.4f}  | {history['loss'][i]:.4f}     | {history['val_loss'][i]:.4f}")
            
    # Run predictions on test set
    print("\nRunning inference on test dataset...")
    predictions = model.predict(test_generator, steps=len(test_generator), verbose=1)
    y_pred_probs = predictions
    y_pred_classes = np.argmax(predictions, axis=1)
    y_true_classes = test_generator.classes

    if not class_labels:
        class_labels = list(test_generator.class_indices.keys())

    # 2. Confusion Matrix
    format_section("2. Confusion Matrix")
    cm = confusion_matrix(y_true_classes, y_pred_classes)
    print("Full Confusion Matrix:\n")
    print(cm)
    
    print("\nClass-wise Accuracy:")
    cm_diag = cm.diagonal()
    cm_totals = cm.sum(axis=1)
    class_accuracies = cm_diag / np.maximum(cm_totals, 1)
    for i, label in enumerate(class_labels):
        print(f"  {label:<25}: {class_accuracies[i]:.2%}")
        
    cm_list = cm.tolist()
        
    print("\nMost Confused Class Pairs:")
    np.fill_diagonal(cm, 0)
    top_confusions = np.dstack(np.unravel_index(np.argsort(cm.ravel())[::-1], cm.shape))[0]
    shown = 0
    for r, c in top_confusions:
        if cm[r, c] == 0 or shown >= 5: break
        print(f"  True: {class_labels[r]:<20} -> Pred: {class_labels[c]:<20} ({cm[r,c]} times)")
        shown += 1

    # 3. Classification Report
    format_section("3. Classification Report")
    report = classification_report(y_true_classes, y_pred_classes, target_names=class_labels, digits=4, zero_division=0)
    report_dict = classification_report(y_true_classes, y_pred_classes, target_names=class_labels, digits=4, zero_division=0, output_dict=True)
    print(report)

    # 4. Top-K Accuracy
    format_section("4. Top-K Accuracy")
    top1_acc = accuracy_score(y_true_classes, y_pred_classes)
    try:
        top3_acc = top_k_accuracy_score(y_true_classes, y_pred_probs, k=min(3, num_classes), labels=range(num_classes))
    except ValueError:
        top3_acc = float('nan')
    print(f"Top-1 Accuracy: {top1_acc:.4f}")
    if not np.isnan(top3_acc):
        print(f"Top-3 Accuracy: {top3_acc:.4f}")

    # 5. Confidence Distribution Analysis
    format_section("5. Confidence Distribution Analysis")
    correct_mask = y_true_classes == y_pred_classes
    incorrect_mask = ~correct_mask
    
    max_probs = np.max(y_pred_probs, axis=1)
    avg_conf_correct = np.mean(max_probs[correct_mask]) if np.any(correct_mask) else 0.0
    avg_conf_incorrect = np.mean(max_probs[incorrect_mask]) if np.any(incorrect_mask) else 0.0
    
    print(f"Average confidence (Correct Predictions):   {avg_conf_correct:.4f}")
    print(f"Average confidence (Incorrect Predictions): {avg_conf_incorrect:.4f}")
    
    overconfident_errors = np.sum((max_probs > CONFIDENCE_THRESHOLD) & incorrect_mask)
    print(f"\nOverconfidence Cases (Incorrect but Conf > {CONFIDENCE_THRESHOLD}): {overconfident_errors}")

    # 6. Calibration Insight
    format_section("6. Calibration Insight")
    bins = np.linspace(0.0, 1.0, 11)
    bin_indices = np.digitize(max_probs, bins) - 1
    
    print(f"{'Confidence Bin':<18} | {'Samples':<8} | {'Accuracy':<8}")
    print("-" * 40)
    for i in range(10):
        in_bin = (bin_indices == i)
        samples_in_bin = np.sum(in_bin)
        if samples_in_bin > 0:
            acc_in_bin = np.mean(correct_mask[in_bin])
            print(f"{bins[i]:.1f} - {bins[i+1]:.1f}          | {samples_in_bin:<8} | {acc_in_bin:.2%}")

    # 7. OOD Sensitivity Test
    format_section("7. OOD Sensitivity Test")
    if os.path.exists(OOD_DIR):
        ood_images = [os.path.join(OOD_DIR, f) for f in os.listdir(OOD_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))][:5]
        if not ood_images:
            print("No images found in OOD directory.")
        for img_path in ood_images:
            # Single image preprocessing
            img = load_img(img_path, target_size=IMG_SIZE)
            img_array = img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            
            pred = model.predict(img_array, verbose=0)[0]
            pred_class_idx = np.argmax(pred)
            conf = pred[pred_class_idx]
            
            flag = "⚠️ FLAG (High Conf!)" if conf > CONFIDENCE_THRESHOLD else "OK"
            print(f"Image: {os.path.basename(img_path):<15} | Pred: {class_labels[pred_class_idx]:<20} | Conf: {conf:.4f} | {flag}")
    else:
        print(f"OOD Directory '{OOD_DIR}' not found. Please add 5 non-plant images and create this folder.")

    # 8. Sample Predictions Output
    format_section("8. Sample Predictions Output")
    sample_indices = np.random.choice(len(y_true_classes), min(10, len(y_true_classes)), replace=False)
    
    for idx in sample_indices:
        file_name = os.path.basename(test_generator.filepaths[idx])
        true_label = class_labels[y_true_classes[idx]]
        pred_label = class_labels[y_pred_classes[idx]]
        conf = max_probs[idx]
        
        top3_indices = np.argsort(y_pred_probs[idx])[-3:][::-1]
        top3_preds = [(class_labels[i], y_pred_probs[idx][i]) for i in top3_indices]
        
        print(f"File: {file_name}")
        print(f"  True Label:  {true_label}")
        print(f"  Pred Label:  {pred_label} (Conf: {conf:.4f})")
        print(f"  Top-3 Preds:")
        for t_label, t_conf in top3_preds:
            print(f"    - {t_label}: {t_conf:.4f}")
        print("-" * 30)

    # 9. Model Summary
    format_section("9. Model Summary")
    total_params = model.count_params()
    trainable_params = sum([tf.keras.backend.count_params(w) for w in model.trainable_weights])
    model_size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
    
    print(f"Total Parameters:     {total_params:,}")
    print(f"Trainable Parameters: {trainable_params:,}")
    print(f"Model File Size:      {model_size_mb:.2f} MB")

    # 10. Final Verdict Section
    format_section("10. Final Verdict")
    
    # Simple heuristics based on gathered data
    is_overfitting = False
    if history:
        acc_diff = final_acc - final_val_acc
        loss_diff = final_val_loss - final_loss
        is_overfitting = acc_diff > 0.05 or loss_diff > 0.1
        
    weak_classes = [class_labels[i] for i, acc in enumerate(class_accuracies) if acc < 0.80]
    
    print("Is model overfitting?                 " + ("YES ⚠️" if is_overfitting else "NO ✅"))
    
    # Assess threshold
    reasonable_thresh = avg_conf_incorrect < CONFIDENCE_THRESHOLD < avg_conf_correct
    print(f"Is confidence threshold 0.60 ideal?  " + ("YES ✅" if reasonable_thresh else "Consider Adjusting ⚠️"))
    
    print("Are certain classes weak?             " + ("YES (" + ", ".join(weak_classes) + ") ⚠️" if weak_classes else "NO ✅"))
    
    demo_ready = not is_overfitting and len(weak_classes) <= len(class_labels)*0.2 and top1_acc > 0.85
    print("\nIS THE MODEL DEMO-READY?              " + ("YES 🚀" if demo_ready else "NEEDS WORK 🔴"))
    print("="*50 + "\n")
    
    # Save Report
    evaluation_results = {
        "top1_accuracy": float(top1_acc),
        "top3_accuracy": float(top3_acc) if not np.isnan(top3_acc) else None,
        "classification_report": report_dict,
        "confusion_matrix": cm_list,
        "weak_classes": weak_classes,
        "overfitting_suspected": is_overfitting,
        "demo_ready": demo_ready
    }
    
    with open(REPORT_SAVE_PATH, 'w') as f:
        json.dump(evaluation_results, f, indent=4)
        print(f"Saved evaluation report to {REPORT_SAVE_PATH}")

if __name__ == "__main__":
    # Ensure reproducibility
    np.random.seed(42)
    tf.random.set_seed(42)
    
    # Suppress TF warnings for cleaner output
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    
    main()
