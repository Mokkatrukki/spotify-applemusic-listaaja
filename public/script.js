document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  
  loginButton.addEventListener('click', () => {
    alert('Authentication feature coming soon!');
  });
  
  // Check server health
  fetch('/api/health')
    .then(response => response.json())
    .then(data => {
      console.log('Server status:', data);
    })
    .catch(error => {
      console.error('Error checking server health:', error);
    });
}); 