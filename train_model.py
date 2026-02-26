import os
import json
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ==========================================
# TRAINING CONFIGURATIONS
# ==========================================
DATASET_PATH = 'dataset/PlantVillage' # Update this path to your actual dataset directory
MODEL_SAVE_PATH = 'models/plant_disease_model.h5'
LABELS_SAVE_PATH = 'models/class_labels.json'
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 10

def train_model():
    """
    Compiles and trains a MobileNetV2 transfer learning model on a plant disease dataset.
    """
    if not os.path.exists('models'):
        os.makedirs('models')

    if not os.path.exists(DATASET_PATH):
        print(f"Dataset path {DATASET_PATH} not found. Please add your datasets.")
        return

    # Data Augmentation & Loading Generator
    datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
        validation_split=0.2, # 80-20 train-test split
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True
    )

    train_generator = datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    val_generator = datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    # Save class indices mapping to be used during inference
    class_indices = train_generator.class_indices
    class_labels = {v: k for k, v in class_indices.items()}
    with open(LABELS_SAVE_PATH, 'w') as f:
        json.dump(class_labels, f)

    # Import Base Model - MobileNetV2 
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False # Freeze base layers temporarily

    # Custom Classification Top Layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    predictions = Dense(train_generator.num_classes, activation='softmax')(x)

    # Compile Final Model
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # Start Training
    print("Starting Model Training Phase...")
    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS
    )

    # Save Checkpoint
    model.save(MODEL_SAVE_PATH)
    print(f"Training Complete! Model saved successfully to {MODEL_SAVE_PATH}")
    print(f"Class labels saved to {LABELS_SAVE_PATH}")

if __name__ == "__main__":
    train_model()
