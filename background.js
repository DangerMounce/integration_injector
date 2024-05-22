chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'changeFavicon') {
      chrome.action.setIcon({
        path: {
          "16": `images/${message.icon}`,
          "48": `images/${message.icon}`,
          "128": `images/${message.icon}`
        }
      });
    } else if (message.action === 'resetFavicon') {
      chrome.action.setIcon({
        path: {
          "16": "images/favicon.png",
          "48": "images/favicon.png",
          "128": "images/favicon.png"
        }
      });
    }
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.storage.local.get(['replaceImages', 'replaceText'], (result) => {
        if (result.replaceImages && result.replaceText) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: replaceTargetImages,
            args: [result.replaceImages, result.replaceText]
          });
        }
      });
    }
  });
  
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
  