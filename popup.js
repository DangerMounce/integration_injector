document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['replaceImages', 'replaceText'], (result) => {
      if (result.replaceImages && result.replaceText) {
        showStopButton();
      } else {
        showApplyButton();
      }
    });
  });
  
  document.getElementById('replace-images').addEventListener('click', () => {
    const selector = document.getElementById('image-selector');
    const selectedImage = selector.value;
    const selectedText = selector.options[selector.selectedIndex].text;
  
    chrome.storage.local.set({ replaceImages: selectedImage, replaceText: selectedText }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: replaceImagesAndText,
          args: [selectedImage, selectedText]
        }, () => {
          showStopButton();
          window.close();
        });
      });
    });
  
    chrome.runtime.sendMessage({ action: 'changeFavicon', icon: 'favicon_red.png' });
  });
  
  document.getElementById('stop-replacing').addEventListener('click', () => {
    chrome.storage.local.remove(['replaceImages', 'replaceText'], () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: stopReplacingImagesAndText
        }, () => {
          showApplyButton();
        });
      });
    });
  
    chrome.runtime.sendMessage({ action: 'resetFavicon' });
  });
  
  function replaceImagesAndText(newSrc, newText) {
    console.log("Replacing images and text with:", newSrc, newText);
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.includes('API.png')) {
        img.dataset.originalSrc = img.src;
        img.src = newSrc;
      }
    });
  
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const originalTexts = new Map();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue.includes('API')) {
        originalTexts.set(node, node.nodeValue);
        node.nodeValue = node.nodeValue.replace(/\bAPI\b/g, newText);
      }
    }
  
    window.originalTexts = originalTexts;
  }
  
  function stopReplacingImagesAndText() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.originalSrc) {
        img.src = img.dataset.originalSrc;
        delete img.dataset.originalSrc;
      }
    });
  
    if (window.originalTexts) {
      window.originalTexts.forEach((originalText, node) => {
        node.nodeValue = originalText;
      });
      window.originalTexts.clear();
    }
  }
  
  function showStopButton() {
    document.getElementById('image-selector').style.display = 'none';
    document.getElementById('replace-images').style.display = 'none';
    document.getElementById('stop-replacing').style.display = 'block';
    // document.querySelector('p').style.display = 'none';
  }
  
  function showApplyButton() {
    document.getElementById('image-selector').style.display = 'block';
    document.getElementById('replace-images').style.display = 'block';
    document.getElementById('stop-replacing').style.display = 'none';
    // document.querySelector('p').style.display = 'block';
  }
  