import os
import json
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model

# Create models directory
os.makedirs('backend/models', exist_ok=True)

# 1. Create dummy class labels
class_labels = {"0": "Tomato___Bacterial_spot", "1": "Tomato___healthy", "2": "Tomato___Late_blight"}
with open('backend/models/class_labels.json', 'w') as f:
    json.dump(class_labels, f)

# 2. Build and save a dummy model with 3 output classes
base_model = MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
predictions = Dense(3, activation='softmax')(x)
model = Model(inputs=base_model.input, outputs=predictions)

model.save('backend/models/plant_disease_model.h5')
print("Dummy model and labels created.")
