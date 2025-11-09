// DOM Elements
const addressBar = document.getElementById('addressBar');
const mainSearch = document.getElementById('mainSearch');
const aiSidebar = document.getElementById('aiSidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const closeSidebar = document.getElementById('closeSidebar');
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');
const aiChatContainer = document.getElementById('aiChatContainer');
const newTabBtn = document.getElementById('newTabBtn');
const downloadsTray = document.getElementById('downloadsTray');
const contextMenu = document.getElementById('contextMenu');
const voiceBtn = document.getElementById('voiceBtn');

let tabCounter = 1;

// Toggle AI Sidebar
toggleSidebarBtn.addEventListener('click', () => {
    aiSidebar.classList.add('open');
});

closeSidebar.addEventListener('click', () => {
    aiSidebar.classList.remove('open');
});

// AI Chat Functionality
aiSendBtn.addEventListener('click', sendAIMessage);
aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendAIMessage();
    }
});

function sendAIMessage() {
    const message = aiInput.value.trim();
    if (message === '') return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user-message';
    userMsg.innerHTML = `<p><strong>You:</strong> ${message}</p>`;
    aiChatContainer.appendChild(userMsg);

    // Clear input
    aiInput.value = '';

    // Simulate AI response
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        aiMsg.innerHTML = `<p><strong>Comet Assistant:</strong> I'm a demo AI assistant. In a real implementation, I would process your query: "${message}" and provide intelligent responses based on the current page context.</p>`;
        aiChatContainer.appendChild(aiMsg);
        aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
    }, 1000);

    aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
}

// Search functionality
addressBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = addressBar.value.trim();
        if (query) {
            console.log(`Navigating to: ${query}`);
            alert(`In a real browser, this would navigate to: ${query}`);
        }
    }
});

mainSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = mainSearch.value.trim();
        if (query) {
            console.log(`Searching for: ${query}`);
            alert(`In a real browser, this would search for: ${query}`);
        }
    }
});

// Voice Mode
voiceBtn.addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            addressBar.value = transcript;
            alert(`Voice input: ${transcript}`);
        };
        
        recognition.start();
    } else {
        alert('Voice recognition is not supported in your browser.');
    }
});

// Tab Management
newTabBtn.addEventListener('click', () => {
    tabCounter++;
    const tabStrip = document.querySelector('.tab-strip');
    const newTab = document.createElement('div');
    newTab.className = 'tab';
    newTab.setAttribute('data-tab', tabCounter);
    newTab.innerHTML = `
        <span class="tab-title">New Tab ${tabCounter}</span>
        <button class="tab-close"><i class="fas fa-times"></i></button>
    `;
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    // Add active class to new tab
    newTab.classList.add('active');
    
    // Insert before the new tab button
    tabStrip.insertBefore(newTab, newTabBtn);
    
    // Add close functionality
    newTab.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        newTab.remove();
    });
    
    // Add click functionality to switch tabs
    newTab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        newTab.classList.add('active');
    });
});

// Navigation buttons
document.getElementById('backBtn').addEventListener('click', () => {
    console.log('Going back');
    alert('Back button clicked');
});

document.getElementById('forwardBtn').addEventListener('click', () => {
    console.log('Going forward');
    alert('Forward button clicked');
});

document.getElementById('refreshBtn').addEventListener('click', () => {
    console.log('Refreshing page');
    alert('Refresh button clicked');
});

// Context Menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.classList.add('show');
});

document.addEventListener('click', () => {
    contextMenu.classList.remove('show');
});

// Quick Actions
document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => {
        const action = card.querySelector('p').textContent;
        alert(`Quick action: ${action}`);
        aiSidebar.classList.add('open');
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + T for new tab
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        newTabBtn.click();
    }
    
    // Ctrl/Cmd + W to close current tab
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            activeTab.querySelector('.tab-close').click();
        }
    }
    
    // Ctrl/Cmd + J for downloads
    if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        downloadsTray.classList.toggle('open');
    }
});

// Close downloads tray
document.getElementById('closeDownloads').addEventListener('click', () => {
    downloadsTray.classList.remove('open');
});

console.log('Comet Browser Clone loaded successfully!');
