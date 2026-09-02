import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


confusion_matrix = np.array([
    [142, 2, 0, 3, 13],    # Actual: Human
    [0, 135, 3, 0, 8],     # Actual: Cow
    [0, 2, 118, 5, 9],     # Actual: Sheep
    [3, 0, 2, 124, 14],    # Actual: Dog
    [9, 11, 13, 6, 200]    # Actual: None (Background)
])

# Define the target classification labels
classes = ['Human', 'Cow', 'Sheep', 'Dog', 'None']

# Set the figure size to match standard academic formatting
plt.figure(figsize=(7, 5))

# Generate the heatmap using the 'Blues' color map to match the reference image
sns.heatmap(confusion_matrix, 
            annot=True,       # Displays the numbers inside the squares
            fmt="d",          # Formats numbers as integers
            cmap="Blues",     # The specific blue gradient from the image
            xticklabels=classes, 
            yticklabels=classes, 
            cbar=True)        # Includes the color scale bar on the right

# Apply the exact axis labels from your reference
plt.title('Confusion Matrix of MobileNet-SSD')
plt.ylabel('Actual')
plt.xlabel('Predicted')

# Ensure the layout fits cleanly and save a high-resolution copy for the thesis
plt.tight_layout()
plt.savefig('agrosec_confusion_matrix.png', dpi=300, bbox_inches='tight')
plt.show()