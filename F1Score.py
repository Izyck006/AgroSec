import matplotlib.pyplot as plt
import numpy as np

# Data from Table 4.4
classes = ['Human', 'Cow', 'Sheep', 'Dog']
precision = [0.92, 0.90, 0.87, 0.90]
recall = [0.89, 0.92, 0.88, 0.87]
f1_scores = [0.90, 0.91, 0.87, 0.88]

# Set up the bar positioning
x = np.arange(len(classes))
width = 0.25  # Width of the bars

# Create the plot
fig, ax = plt.subplots(figsize=(8, 5))
rects1 = ax.bar(x - width, precision, width, label='Precision', color='#1f77b4')
rects2 = ax.bar(x, recall, width, label='Recall', color='#ff7f0e')
rects3 = ax.bar(x + width, f1_scores, width, label='F1-Score', color='#2ca02c')

# Add labels, title, and formatting
ax.set_ylabel('Score (0.00 - 1.00)')
ax.set_xlabel('Target Class')
ax.set_title('AgroSec Model Performance Metrics')
ax.set_xticks(x)
ax.set_xticklabels(classes)
ax.set_ylim(0, 1.1)  # Set ceiling slightly above 1.0 to fit labels
ax.legend(loc='lower center', bbox_to_anchor=(0.5, -0.25), ncol=3)

# Function to attach the exact numbers above each bar
def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.2f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)

autolabel(rects1)
autolabel(rects2)
autolabel(rects3)

# Save and display
plt.tight_layout()
plt.savefig('agrosec_performance_chart.png', dpi=300, bbox_inches='tight')
plt.show()