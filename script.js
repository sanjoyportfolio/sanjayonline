// --- Global Utilities & Initialization ---

// Function to handle global smooth page transitions for .fancy-link
document.querySelectorAll('.fancy-link').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    // Check if it's an internal section link
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement && window.scrollY !== targetElement.offsetTop) {
        // Smooth scroll effect for internal links
        document.body.style.transition = 'opacity 0.8s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            document.body.style.opacity = '1';
            document.body.style.transition = 'none'; // Reset transition
          }, 800);
        }, 800);
      }
    } else {
      // For external links or other HTML pages (like login.html/profile.html)
      // PREVENT default behavior to handle transition manually
      e.preventDefault();
      document.body.style.transition = 'opacity 0.8s ease';
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = this.href; // Navigate after fade out
      }, 800);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Determine the current page type by body classes
  const isIndexPage = !document.body.classList.contains('profile-body') && !document.body.classList.contains('auth-body');
  const isProfilePage = document.body.classList.contains('profile-body');
  const isAuthPage = document.body.classList.contains('auth-body');
  
  // Define session duration (6 hours in milliseconds)
  const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours
  
  // --- Session Management Logic (for all non-auth pages) ---
  if (!isAuthPage) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    
    if (isLoggedIn === 'true' && lastLoginTime) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - parseInt(lastLoginTime);
      
      if (timeElapsed > SESSION_DURATION) {
        // Session expired, force logout
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastLoginTime'); // Clear the timestamp too
        
        const swalBackground = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
        const swalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        const swalConfirmButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          allowOutsideClick: false,
          showCancelButton: false,
          confirmButtonText: 'Go to Login',
          confirmButtonColor: swalConfirmButtonColor,
          background: swalBackground,
          color: swalColor
        }).then(() => {
          window.location.replace('login.html'); // Use replace to prevent back button issues
        });
        return; // Stop further execution for this page
      }
    } else if (isIndexPage) {
      // If on index page and not logged in (and session didn't just expire),
      // or if it's the very first visit (no lastLoginTime or isLoggedIn), redirect to login
      const hasVisitedSite = localStorage.getItem('hasVisitedSite');
      if (hasVisitedSite !== 'true') {
        localStorage.setItem('hasVisitedSite', 'true');
        window.location.replace('login.html');
        return; // Stop further execution
      }
    }
  }
  
  
  // Function to apply profile picture to hero section
  const applyProfilePicToHero = () => {
    const heroImageElement = document.querySelector('.hero-image img');
    const aboutImageElement = document.querySelector('.about-image img'); // Also update about section image
    if (heroImageElement) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.profilePic) {
        heroImageElement.src = currentUser.profilePic;
        if (aboutImageElement) { // Update about section image if it exists
          aboutImageElement.src = currentUser.profilePic;
        }
      } else {
        // If no profile pic, use default
        heroImageElement.src = 'assets/images/profile.png';
        if (aboutImageElement) {
          aboutImageElement.src = 'assets/images/profile.png';
        }
      }
    }
  };
  
  // Apply profile picture on load for index page
  // This will run AFTER the potential redirect for login/session expire
  if (isIndexPage) {
    applyProfilePicToHero();
  }
  
  
  // --- Main Page Specifics (if on index.html) ---
  if (isIndexPage) {
    const menuIcon = document.querySelector(".menu-icon i");
    const navLinks = document.querySelector(".nav-links"); // This is your mobile menu container
    const navbar = document.querySelector(".navbar");
    const mobileNavAnchorLinks = document.querySelectorAll(".nav-links a[href^='#']");
    
    // Function to close the mobile menu
    const closeMobileMenu = () => {
      if (navLinks.classList.contains("show")) {
        navLinks.classList.remove("show");
        menuIcon.classList.add("fa-bars");
        menuIcon.classList.remove("fa-times");
        document.body.classList.remove("menu-open");
      }
    };
    
    if (menuIcon && navLinks) {
      menuIcon.addEventListener("click", () => {
        navLinks.classList.toggle("show");
        menuIcon.classList.toggle("fa-bars");
        menuIcon.classList.toggle("fa-times");
        document.body.classList.toggle("menu-open");
      });
    }
    
    if (navbar) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      });
    }
    
    // Close menu when clicking outside it
    document.addEventListener("click", (e) => {
      if (navLinks && menuIcon && !navLinks.contains(e.target) && !menuIcon.contains(e.target) && navLinks.classList.contains("show")) {
        closeMobileMenu();
      }
    });
    
    // Close menu when a navigation link is clicked
    if (mobileNavAnchorLinks.length > 0) {
      mobileNavAnchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          closeMobileMenu();
        });
      });
    }
    
    // --- NEW: Profile Icon Navigation (for index.html) ---
    // Ensure your suspecte.png icon has the ID "profileIcon" in your HTML
    const profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
      profileIcon.style.cursor = 'pointer'; // Make it clear it's clickable
      profileIcon.addEventListener('click', function() {
        // Check if user is logged in before redirecting to profile
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
          window.location.href = 'profile.html';
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Please Log In',
            text: 'You need to log in to access your profile.',
            background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
            confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color')
          }).then(() => {
            window.location.href = 'login.html';
          });
        }
      });
    }
    
    // Skills animation (already exists, keeping it)
    document.querySelectorAll('.skill-card .progress-fill').forEach(el => {
      const width = el.parentElement.style.getPropertyValue('--fill-width') || '0%';
      el.style.width = width;
    });
    
    // Scroll Reveal Animation (already exists, keeping it)
    const revealElements = document.querySelectorAll('.edu-card, .timeline-item, .skill-card, .footer-bottom .social-icons');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'all 0.6s ease';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    revealElements.forEach(el => {
      el.style.opacity = 0;
      el.style.transform = 'translateY(50px)';
      revealObserver.observe(el);
    });
    
    // Social Icons Click Effect (already exists, keeping it)
    document.querySelectorAll('.social_icon a').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.add('clicked');
        setTimeout(() => {
          btn.classList.remove('clicked');
        }, 400);
      });
    });
    
    // Newsletter Form Submission (already exists, keeping it)
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
          Swal.fire({
            toast: true,
            icon: 'warning',
            title: 'Please enter your email!',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });
        } else {
          Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Thank you for subscribing!',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });
          emailInput.value = '';
        }
      });
    }
    
    // Contact Form Submission (Global function) (already exists, keeping it)
    window.handleSubmit = function(event) {
      event.preventDefault();
      const form = event.target;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const formData = new FormData(form);
      const name = formData.get('name');
      
      Swal.fire({
        icon: 'success',
        title: 'Thank you!',
        text: `${name}, your message has been sent successfully. I will get back to you soon.`,
        confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
        background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
      }).then(() => {
        form.reset();
      });
    };
  }
  
  
  // --- Authentication Page Specifics (login.html) ---
  if (isAuthPage) {
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const linkToRegister = document.getElementById('linkToRegister');
    const linkToLogin = document.getElementById('linkToLogin');
    const authFormWrapper = document.querySelector('.auth-form-wrapper');
    const authToggleButtons = document.querySelector('.form-toggle-buttons'); // Corrected selector
    
    // Function to dynamically adjust wrapper height based on active form
    function setAuthFormWrapperHeight(form) {
      // Temporarily make the active form visible to calculate its height accurately
      form.style.position = 'relative';
      form.style.visibility = 'visible';
      form.style.opacity = '1';
      form.style.transform = 'translateX(0)';
      
      const height = form.scrollHeight + 20; // Add some padding
      authFormWrapper.style.height = `${height}px`;
      
      // Hide the inactive form (move it off-screen)
      if (form.id === 'loginForm') {
        registerForm.style.position = 'absolute';
        registerForm.style.visibility = 'hidden';
        registerForm.style.opacity = '0';
        registerForm.style.transform = 'translateX(100%)';
      } else {
        loginForm.style.position = 'absolute';
        loginForm.style.visibility = 'hidden';
        loginForm.style.opacity = '0';
        loginForm.style.transform = 'translateX(-100%)';
      }
    }
    
    // Initial setup for form visibility and wrapper height
    // This ensures only login form is visible on load and height is correct
    registerForm.style.position = 'absolute';
    registerForm.style.visibility = 'hidden';
    registerForm.style.opacity = '0';
    registerForm.style.transform = 'translateX(100%)';
    
    setAuthFormWrapperHeight(loginForm);
    
    
    // Event Listeners for switching forms
    showLoginBtn.addEventListener('click', () => showAuthForm('login'));
    showRegisterBtn.addEventListener('click', () => showAuthForm('register'));
    linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthForm('register');
    });
    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthForm('login');
    });
    
    // --- Handle Login Form Submission (simulated) ---
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // Retrieve users from local storage
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && u.password === password);
      
      const swalBackground = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
      const swalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
      const swalConfirmButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('lastLoginTime', Date.now().toString()); // Set last login time
        const currentUserData = { ...user };
        delete currentUserData.password; // Don't store password in currentUser
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
        
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'You are now logged in. Redirecting...',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          background: swalBackground,
          color: swalColor
        }).then(() => {
          window.location.href = 'index.html'; // Redirect to index.html after login
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password. Please try again.',
          confirmButtonColor: swalConfirmButtonColor,
          background: swalBackground,
          color: swalColor
        });
      }
    });
    
    // --- Handle Register Form Submission (simulated) ---
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      let users = JSON.parse(localStorage.getItem('users')) || [];
      
      const swalBackground = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
      const swalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
      const swalConfirmButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
      
      if (!name || !email || !password || !confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Please fill in all fields.',
          confirmButtonColor: swalConfirmButtonColor,
          background: swalBackground,
          color: swalColor
        });
        return;
      }
      
      if (password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Passwords do not match.',
          confirmButtonColor: swalConfirmButtonColor,
          background: swalBackground,
          color: swalColor
        });
        return;
      }
      
      if (users.some(u => u.email === email)) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'An account with this email already exists.',
          confirmButtonColor: swalConfirmButtonColor,
          background: swalBackground,
          color: swalColor
        });
        return;
      }
      
      const newUser = {
        name: name,
        email: email,
        password: password,
        profilePic: 'assets/images/profile.png', // Default profile pic for new users
        dob: '',
        phone: '',
        address: '',
        about: ''
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'You can now log in with your new account.',
        confirmButtonColor: swalConfirmButtonColor,
        background: swalBackground,
        color: swalColor
      }).then(() => {
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = '';
        showAuthForm('login');
      });
    });
  }
  
  
  // --- Profile Page Specifics (profile.html) ---
  if (isProfilePage) {
    const profileDisplayPic = document.getElementById('profileDisplayPic');
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    const userDobInput = document.getElementById('userDob');
    const userPhoneInput = document.getElementById('userPhone');
    const userAddressInput = document.getElementById('userAddress');
    const userAboutTextarea = document.getElementById('userAbout');
    const changePicBtn = document.getElementById('changePicBtn');
    const galleryModal = document.getElementById('galleryModal');
    const closeButton = document.querySelector('.gallery-modal .close-button');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const confirmSelectionBtn = document.getElementById('confirmSelectionBtn');
    const profileEditForm = document.getElementById('profileEditForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    let selectedGalleryPic = null;
    
    // *** Authentication Check for Profile Page ***
    // This check is now integrated with the global session management
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    let currentUserData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!isLoggedIn || !currentUserData || !currentUserData.email) {
      // This block will execute if the global session check has not already redirected
      // E.g., if directly navigating to profile.html without a valid session.
      const swalBackground = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
      const swalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
      const swalConfirmButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
      
      Swal.fire({
        icon: 'warning',
        title: 'Access Denied',
        text: 'Please log in to view your profile.',
        allowOutsideClick: false,
        showCancelButton: false,
        confirmButtonText: 'Go to Login',
        confirmButtonColor: swalConfirmButtonColor,
        background: swalBackground,
        color: swalColor
      }).then(() => {
        window.location.replace('login.html'); // Use replace here too
      });
      return;
    }
    
    // --- NEW: Function to load and FIX profile data into fields ---
    function loadProfileData() {
      // FIX THE NAME AND EMAIL
      userNameInput.value = 'Sanjay Das'; // Fixed Name
      userEmailInput.value = 'sanjay.das@example.com'; // Fixed Email
      
      // Load other data from currentUserData if it exists
      profileDisplayPic.src = currentUserData.profilePic || 'assets/images/profile.png';
      userDobInput.value = currentUserData.dob || '';
      userPhoneInput.value = currentUserData.phone || '';
      userAddressInput.value = currentUserData.address || '';
      userAboutTextarea.value = currentUserData.about || '';
      
      // Disable Name and Email fields as they are fixed
      if (userNameInput) userNameInput.readOnly = true;
      if (userEmailInput) userEmailInput.readOnly = true;
    }
    
    loadProfileData();
    
    // Open gallery modal
    changePicBtn.addEventListener('click', () => {
      galleryModal.style.display = 'flex';
      galleryItems.forEach(item => {
        item.classList.remove('selected');
        // Pre-select if current profile pic is in gallery
        // Adjust path comparison: ensure the stored path matches the gallery item's data-path
        const currentProfilePicPath = profileDisplayPic.src; // Full path from display
        const galleryItemFullPath = new URL(item.dataset.path, window.location.href).href; // Get full URL for comparison
        
        // Simple comparison: if the full URLs match
        if (currentProfilePicPath === galleryItemFullPath) {
          item.classList.add('selected');
          selectedGalleryPic = item.dataset.path;
          confirmSelectionBtn.disabled = false;
        }
      });
      // If no pre-selected, disable confirm button
      if (!selectedGalleryPic) {
        confirmSelectionBtn.disabled = true;
      }
    });
    
    // Close gallery modal
    closeButton.addEventListener('click', () => {
      galleryModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
      if (e.target == galleryModal) {
        galleryModal.style.display = 'none';
      }
    });
    
    // Handle gallery item selection
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        galleryItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        selectedGalleryPic = item.dataset.path;
        confirmSelectionBtn.disabled = false;
      });
    });
    
    // Confirm profile picture selection
    confirmSelectionBtn.addEventListener('click', () => {
      if (selectedGalleryPic) {
        profileDisplayPic.src = selectedGalleryPic; // Update the profile picture on the profile page
        
        currentUserData.profilePic = selectedGalleryPic;
        
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUserData.email);
        if (userIndex !== -1) {
          users[userIndex].profilePic = selectedGalleryPic;
          localStorage.setItem('users', JSON.stringify(users));
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
        galleryModal.style.display = 'none';
        
        const swalBackground = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
        const swalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        
        Swal.fire({
          toast: true,
          icon: 'success', // Changed to success for confirmation
          title: 'Profile picture updated!',
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: swalBackground,
          color: swalColor,
        });
      }
    });
    
    // Handle Profile Edit Form Submission (simulated) (already exists, keeping it)
    profileEditForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Name and Email are now fixed, so no need to get their values from inputs for update
      const newDob = userDobInput.value;
      const newPhone = userPhoneInput.value.trim();
      const newAddress = userAddressInput.value.trim();
      const newAbout = userAboutTextarea.value.trim();
      
      const swalBackground = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
      const swalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
      const swalConfirmButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
      
      
      currentUserData.dob = newDob;
      currentUserData.phone = newPhone;
      currentUserData.address = newAddress;
      currentUserData.about = newAbout;
      
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === currentUserData.email);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          dob: newDob,
          phone: newPhone,
          address: newAddress,
          about: newAbout
        };
        localStorage.setItem('users', JSON.stringify(users));
      }
      localStorage.setItem('currentUser', JSON.stringify(currentUserData));
      
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile information has been updated (simulated).',
        confirmButtonColor: swalConfirmButtonColor,
        background: swalBackground,
        color: swalColor
      });
      loadProfileData(); // Reload data to ensure consistency (will keep name/email fixed)
    });
    
    // Handle Logout (already exists, keeping it)
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const swalBackground = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
        const swalColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
        const swalConfirmButtonColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        
        Swal.fire({
          title: 'Are you sure?',
          text: "You will be logged out!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: swalConfirmButtonColor,
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, log me out!',
          background: swalBackground,
          color: swalColor
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('lastLoginTime'); // Clear last login time on explicit logout
            localStorage.removeItem('hasVisitedSite'); // Reset for next first visit
            
            Swal.fire({
              icon: 'success',
              title: 'Logged Out!',
              text: 'You have been successfully logged out.',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
              background: swalBackground,
              color: swalColor
            }).then(() => {
              window.location.replace('login.html'); // Use replace here
            });
          }
        });
      });
    }
  }
});

// typings effect (already exists, keeping it)
document.addEventListener("DOMContentLoaded", function() {
  const dynamicTextElement = document.getElementById('dynamic-text');
  const phrases = [
    "I'm a junior Web Developer",
    "Learning HTML, CSS and JS."
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  const typingSpeed = 70;
  const deletingSpeed = 40;
  const pauseBetweenPhrases = 1500;
  
  function typeWriter() {
    if (!dynamicTextElement) return; // Add a check to ensure element exists
    
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      dynamicTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      dynamicTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let currentTypingSpeed = typingSpeed;
    if (isDeleting) {
      currentTypingSpeed = deletingSpeed;
    }
    
    if (!isDeleting && charIndex === currentPhrase.length) {
      currentTypingSpeed = pauseBetweenPhrases;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      currentTypingSpeed = typingSpeed;
    }
    
    setTimeout(typeWriter, currentTypingSpeed);
  }
  
  typeWriter();
});


// --- Chat Bot Logic ---
// --- DOM Elements ---
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatBotContainer = document.getElementById("chatBotContainer");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

let chatBotOpen = false;

// --- Add Message ---
function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", `${sender}-message`);
  messageElement.innerHTML = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- Bot Response Data ---
const responses = {
  greetings: [
    "হ্যালো! 😊 আমি আছি আপনাকে সাহায্য করতে।",
    "Hi there! কিভাবে সাহায্য করতে পারি?",
    "Hey! Let's explore Sanjay's portfolio, shall we?",
    "Welcome! আমি সঞ্জয়ের অ্যাসিস্টেন্ট। কি জানতে চান?",
    "হাই! 😄 কিছু জানতে চাইলে জিজ্ঞাসা করুন।",
  ],
  howAreYou: [
    "আমি ভালোই আছি, ধন্যবাদ! 😇 আপনি কেমন আছেন?",
    "Bot never sleeps! 😴 চলুন কাজ শুরু করি!",
    "Feeling great, কারণ সঞ্জয় সবসময় কিছু শিখছে।",
    "ভালোই আছি, portfolio ready আছে দেখার জন্য!",
    "চমৎকার! আপনার কিছুর দরকার আছে কি?",
  ],
  whoAreYou: [
    "আমি Bot — তার ডিজিটাল সহকারী।",
    "I'm built to guide you through Sanjay's skills.",
    "AI Assistant 🤖, powered by Sanjay's portfolio!",
    "সঞ্জয়ের পোর্টফোলিও এক্সপ্লোর করতে আমি আছি।",
    "সহজ ভাষায় বললে — সঞ্জয় সম্পর্কে সব জানি!",
  ],
  skills: [
    "**Skills**: HTML5 (95%), CSS3 (90%), JavaScript (45%) 🌐",
    "Modern frontend skillset — clean & fast UI.",
    "Coding with ❤️ — HTML, CSS, JS",
    "Web dev দক্ষতা: সবই ইউজার ফ্রেন্ডলি ওয়েব বানাতে।",
    "Ongoing learner, always upskilling 📚",
  ],
  projects: [
    "Portfolio site 💻, Messenger Bot 🤖 — সবই নিজ হাতে বানানো।",
    "Recent work: Top-up Website & AI Chat UI.",
    "Project demo চাইলে বলবেন! 🧪",
    "Sanjay loves real-world projects with clean UI.",
    "Building, testing, delivering — that’s Sanjay's motto.",
  ],
  contact: [
    "Here is everything about my owner, contact him!☺️"
  ],
  education: [
    "🎓 HSC - Notre Dame College",
    "📘 SSC - High School, GPA: 4.06",
    "Studied Science, still exploring tech! 🧠",
    "Academic to practical — তার পথ চলা এখনো চলছে।",
    "Learner first, developer forever!",
  ],
  experience: [
    "1+ year experience in web development 💻",
    "Completed 3+ real projects with real users.",
    "Building user-first apps with performance in mind.",
    "Love solving real-world UI/UX problems.",
    "Learning never stops, coding never sleeps!",
  ],
  about: [
    "সঞ্জয় creative & detail-focused একজন frontend developer।",
    "He codes not just to make things work, but to impress! 💥",
    "User-first thinking makes him stand out.",
    "He believes in clean UI & smooth UX.",
    "Passion meets profession — that’s Sanjay!",
  ],
  location: [
    "📍Currently living in Dhaka, Bangladesh.",
    "Based in BD, working globally 🌍",
    "From Dhaka with code! 🏙️",
    "Location never limits vision.",
    "ঢাকা শহর থেকেই বড় স্বপ্নের যাত্রা শুরু!",
  ],
  birthday: [
    "🎂 20 June 2007 — সঞ্জয়ের জন্মদিন!",
    " June 20th 2007!",
    "The world got a coder on 20 June 💖",
    "সেই দিনটি যেদিন ভবিষ্যতের কোডার জন্মেছিল।",
    "Celebrates every birthday with one more skill learned!",
  ],
  goodbye: [
    "👋 বিদায়! আবার দেখা হবে!",
    "Take care! Visit Sanjay’s site again soon!",
    "Thank you for stopping by 🙏",
    "It was nice chatting with you!",
    "Stay safe & keep exploring tech!",
  ],
  good: [
    "Thanks You sir!",
    "Take Care!",
  ],
  thanks: [
    "আপনাকেও ধন্যবাদ! 😇",
    "My pleasure to assist!",
    "Thanks a lot! Need anything else?",
    "Welcome anytime!",
    "🙂 Always here to help!",
  ],
  admin: [`
<div style="
  font-family: 'Signika', sans-serif; 
  max-width: 100%; 
  background: linear-gradient(135deg, #1f1f2e, #27293d);
  color: #e0e6f8; 
  padding: 25px; 
  border-radius: 16px; 
  box-shadow: 0 8px 20px rgba(0, 255, 255, 0.3);
  line-height: 1.5;
">
  <h2 style="text-align: center; color: #00f3ff; font-weight: 900; letter-spacing: 1px; margin-bottom: 20px;">
    <i class="fa-solid fa-user"></i> SANJAY DAS
  </h2>
  
  <div style="margin-bottom: 18px;">
    <p><i class="fa-solid fa-cake-candles" style="color:#ff6b6b; margin-right: 8px;"></i><strong>Age:</strong> 18</p>
    <p><i class="fa-solid fa-birthday-cake" style="color:#feca57; margin-right: 8px;"></i><strong>Birthday:</strong> 20 JUN 2007</p>
    <p><i class="fa-solid fa-mars" style="color:#54a0ff; margin-right: 8px;"></i><strong>Gender:</strong> Male</p>
  </div>
  
  <div style="font-style: italic; color: #48dbfb; margin-bottom: 20px;">
    Mindset: Overthinker, Romantic, Loyal Lover<br>
    Focus: <span style="font-weight: 700; color: #ff9f43;">10% Study | 90% Love & Vibe</span><br>
    Education: 1st Year Student
  </div>
  
  <div style="margin-bottom: 22px;">
    <h3 style="border-bottom: 2px solid #00f3ff; padding-bottom: 6px; margin-bottom: 12px; font-weight: 700;">
      <i class="fa-solid fa-code"></i> Skills
    </h3>
    <ul style="list-style: none; padding-left: 0; margin: 0;">
      <li style="margin-bottom: 6px;"><i class="fa-solid fa-check" style="color: #ff6b6b;"></i> HTML - 95%</li>
      <li style="margin-bottom: 6px;"><i class="fa-solid fa-check" style="color: #ff6b6b;"></i> CSS - 80%</li>
      <li><i class="fa-solid fa-check" style="color: #ff6b6b;"></i> JavaScript - 40%</li>
    </ul>
  </div>
  
  <div style="margin-bottom: 22px;">
    <h3 style="border-bottom: 2px solid #00f3ff; padding-bottom: 6px; margin-bottom: 12px; font-weight: 700;">
      <i class="fa-solid fa-address-book"></i> Contact Info
    </h3>
    <p><i class="fa-solid fa-envelope" style="color: #54a0ff; margin-right: 8px;"></i><a href="mailto:sanjaydas@gmail.com" style="color: #70a1ff; text-decoration: none;">sanjaydas@gmail.com</a></p>
    <p><i class="fa-solid fa-phone" style="color: #54a0ff; margin-right: 8px;"></i><a href="tel:+8801727503540" style="color: #70a1ff; text-decoration: none;">+880 1727 503540</a></p>
    <p><i class="fa-brands fa-facebook" style="color: #3b5998; margin-right: 8px;"></i><span>সঞ্জয় দাস</span></p>
    <p><i class="fa-brands fa-whatsapp" style="color: #25d366; margin-right: 8px;"></i><a href="https://wa.me/8801727503540" target="_blank" style="color: #70a1ff; text-decoration: none;">Chat Now</a></p>
    <p><i class="fa-brands fa-instagram" style="color: #c13584; margin-right: 8px;"></i><a href="https://instagram.com/broken_hurt_143" target="_blank" style="color: #70a1ff; text-decoration: none;">@broken_hurt_143</a></p>
  </div>
  
  <div style="margin-bottom: 22px;">
    <h3 style="border-bottom: 2px solid #00f3ff; padding-bottom: 6px; margin-bottom: 12px; font-weight: 700;">
      <i class="fa-solid fa-heart"></i> Relationship
    </h3>
    <p><strong>Taken by:</strong> <span style="color: #ff6b6b; font-weight: 700;">AISHI</span></p>
    <p><strong>Loyalty:</strong> Infinite</p>
  </div>
  
  <div>
    <h3 style="border-bottom: 2px solid #00f3ff; padding-bottom: 6px; margin-bottom: 12px; font-weight: 700;">
      <i class="fa-solid fa-star"></i> Favourites
    </h3>
    <p><strong>Song:</strong> Hua Hein Aaj Pehli Baar</p>
    <p><strong>Food:</strong> Biriyani, Chicken</p>
    <p><strong>Game:</strong> Free Fire</p>
    <p><strong>Movie:</strong> Romantic</p>
  </div>
</div>
`],
  whoareu: [
    "আমি একটা বট 🤖",
    "সঞ্জয়ে'র সহকারী Robot!",
  ],
  help: [
    "I can help you with all the contacts of Sanjay! Please contact him and tell him about your problem. Thank you.",
  ],
  unknown: [
    "Sorry, এটা বুঝতে পারিনি 😅",
    "আপনি কি একটু স্পষ্ট করে বলবেন?",
    "Hmm… এটা হয়তো আমি জানি না, কিন্তু ট্রাই করতে পারি!",
    "আমার বুদ্ধিতে একটু কমে গেছে মনে হচ্ছে 🤖",
  ],
};

const socialLinks = `
    <ul>
      <li><a href="mailto:im.the.devil.god2067@gmail.com">Email</a></li>
      <li><a href="tel:+8801727503540">Phone</a></li>
      <li><a href="https://sanjayonline.vercel.app" target="_blank">Website</a></li>
      <li><a href="https://www.facebook.com/share/1Asrx5vw6q/" target="_blank">Facebook</a></li>
      <li><a href="https://wa.me/8801727503540" target="_blank">WhatsApp</a></li>
      <li><a href="https://www.instagram.com/broken_hurt_143/" target="_blank">Instagram</a></li>
    </ul>
  `;

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getBotResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  const match = (keywords) => keywords.some(word => msg.includes(word));
  
  if (match(["hello", "hi", " হাই", "হ্যালো", "হেলো"])) return getRandom(responses.greetings);
  if (match(["who are you", "who", "কে তুমি", "কে"])) return getRandom(responses.whoareu);
  if (match(["good", "nice", " গুড", "নাইস"])) return getRandom(responses.good);
  if (match(["how are you", "কেমন আছো"])) return getRandom(responses.howAreYou);
  if (match(["your name", "তোমার নাম"])) return getRandom(responses.whoAreYou);
  if (match(["skills", "technologies"])) return getRandom(responses.skills);
  if (match(["admin", "sanjay"," sonjoy","সঞ্জয়"])) return getRandom(responses.admin);
  if (match(["projects", "portfolio work"])) return getRandom(responses.projects);
  if (match(["contact", "hire me", "কন্টাক্ট"])) return getRandom(responses.contact) + socialLinks;
  if (match(["education", "study"])) return getRandom(responses.education);
  if (match(["experience"])) return getRandom(responses.experience);
  if (match(["about sanjay", "about you", "about"])) return getRandom(responses.about);
  if (match(["location", "where are you"])) return getRandom(responses.location);
  if (match(["birthday", "date of birth"])) return getRandom(responses.birthday);
  if (match(["thank you", "thanks"])) return getRandom(responses.thanks);
  if (match(["bye", "good bye", "বায়"])) return getRandom(responses.goodbye);
  if (match(["help", "সাহায্য"])) return getRandom(responses.help) + socialLinks;
  
  return getRandom(responses.unknown);
}

// --- Toggle Chat ---
chatToggleBtn.addEventListener("click", () => {
  chatBotOpen = !chatBotOpen;
  chatBotContainer.classList.toggle("show", chatBotOpen);
  if (chatBotOpen) chatInput.focus();
});

// --- Close Chat ---
closeChatBtn.addEventListener("click", () => {
  chatBotOpen = false;
  chatBotContainer.classList.remove("show");
});

// --- Send Button ---
sendMessageBtn.addEventListener("click", () => {
  const userMessage = chatInput.value.trim();
  if (userMessage) {
    addMessage(userMessage, "user");
    chatInput.value = "";
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      addMessage(botResponse, "bot");
    }, 500);
  }
});

// --- Enter Key Press ---
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessageBtn.click();
});
