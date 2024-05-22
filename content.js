console.log("Content script loaded");

// Function to replace specific target images and text
function replaceTargetImages(newSrc, newText) {
  console.log("Replacing target images and text with:", newSrc, newText);

  // Replace images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.src.includes('API.png')) {
      console.log("Replacing image:", img.src);
      img.dataset.originalSrc = img.src;  // Store original src
      img.src = newSrc;
      console.log("New image src:", img.src);
    }
  });

  // Replace text
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const originalTexts = new Map(); // Store original texts in a Map
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.includes('API')) {
      console.log("Replacing text:", node.nodeValue);
      originalTexts.set(node, node.nodeValue);  // Store original text
      node.nodeValue = node.nodeValue.replace(/\bAPI\b/g, newText);  // Replace exact "API" and containing "API"
      console.log("New text:", node.nodeValue);
    }
  }

  // Save the original texts Map to the window object
  window.originalTexts = originalTexts;
}

// Check if the target images and text should be replaced
chrome.storage.local.get(['replaceImages', 'replaceText'], (result) => {
  console.log("Storage result:", result);
  if (result.replaceImages && result.replaceText) {
    replaceTargetImages(result.replaceImages, result.replaceText);
  }
});
