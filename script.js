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
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatBotContainer = document.getElementById("chatBotContainer");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

let chatBotOpen = false; // To track if the chat bot is open

// Function to add a message to the chat interface
function addMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", `${sender}-message`);
  messageElement.innerHTML = message; // Use innerHTML to render links
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message
}

// Simple Chat Bot Responses with more text and social links
function getBotResponse(userMessage) {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Social Media Links (replace with actual links)
  const socialLinks = `
    <ul>
      <li><a href="https://www.facebook.com/yourprofile" target="_blank">Facebook</a></li>
      <li><a href="https://github.com/yourprofile" target="_blank">GitHub</a></li>
      <li><a href="https://wa.me/8801727503540" target="_blank">WhatsApp</a></li>
      <li><a href="https://www.linkedin.com/in/yourprofile" target="_blank">LinkedIn</a></li>
      <li><a href="https://twitter.com/yourprofile" target="_blank">Twitter</a></li>
      <li><a href="https://www.instagram.com/yourprofile" target="_blank">Instagram</a></li>
      <li><a href="https://www.youtube.com/yourchannel" target="_blank">YouTube</a></li>
      <li><a href="mailto:im.the.devil.god2067@gmail.com">Email</a></li>
      <li><a href="tel:+8801727503540">Phone</a></li>
      <li><a href="https://yourwebsite.com" target="_blank">Personal Website</a></li>
    </ul>
  `;
  
  if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
    return "Hello! আমি সঞ্জয়ের সহায়ক সহকারী বট। আমি আপনাকে কিভাবে সাহায্য করতে পারি? তার ব্যাকগ্রাউন্ড, শিক্ষা, দক্ষতা, বা প্রকল্প সম্পর্কে জিজ্ঞাসা করতে পারেন। আমি আপনার যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।";
  } else if (lowerCaseMessage.includes("how are you")) {
    return "আমি পুরোপুরি ঠিকঠাক কাজ করছি, জিজ্ঞাসা করার জন্য ধন্যবাদ! একজন এআই হিসেবে আমার কোনো আবেগ নেই, তবে সঞ্জয়ের পোর্টফোলিও সম্পর্কে তথ্য দিতে আমি সর্বদা প্রস্তুত। আপনার যদি কোনো নির্দিষ্ট প্রশ্ন থাকে, তাহলে নির্দ্বিধায় জিজ্ঞাসা করুন।";
  } else if (lowerCaseMessage.includes("your name") || lowerCaseMessage.includes("who are you")) {
    return "আমি একটি ভার্চুয়াল সহকারী যা সঞ্জয় দাস এবং তার কাজ সম্পর্কে তথ্য সরবরাহ করার জন্য ডিজাইন করা হয়েছে। আমার উদ্দেশ্য হল আপনাকে তার পোর্টফোলিও নেভিগেট করতে এবং একজন জুনিয়র ওয়েব ডেভেলপার হিসাবে তার ক্ষমতা সম্পর্কে আরও জানতে সহায়তা করা। আমি এখানে আপনার প্রশ্নের উত্তর দিতে এসেছি।";
  } else if (lowerCaseMessage.includes("skills") || lowerCaseMessage.includes("technologies")) {
    return "সঞ্জয়ের ওয়েব কন্টেন্ট স্ট্রাকচার করার জন্য **HTML5 (95%)** এবং স্টাইলিং ও রেসপনসিভ ডিজাইনের জন্য **CSS3 (90%)** এ শক্তিশালী মৌলিক দক্ষতা রয়েছে। তিনি ডাইনামিক এবং ইন্টারেক্টিভ ওয়েব অ্যাপ্লিকেশন তৈরির জন্য **জাভাস্ক্রিপ্ট (45%)** এও সক্রিয়ভাবে তার দক্ষতা বৃদ্ধি করছেন। আধুনিক ওয়েব ডেভেলপমেন্টের জন্য তার টুলকিট সর্বদা প্রসারিত করার জন্য তার শেখার প্রতি নিবেদন রয়েছে।";
  } else if (lowerCaseMessage.includes("projects") || lowerCaseMessage.includes("portfolio work")) {
    return "সঞ্জয় বেশ কয়েকটি উল্লেখযোগ্য প্রকল্প সম্পন্ন করেছেন, যার মধ্যে তার ব্যক্তিগত **পোর্টফোলিও ওয়েবসাইট** নিজেই রয়েছে, যা তার ফ্রন্ট-এন্ড ডেভেলপমেন্টের ক্ষমতা প্রদর্শন করে। তিনি একটি **ফেসবুক মেসেঞ্জার বট**ও তৈরি করেছেন, যা ইন্টারেক্টিভ এবং স্বয়ংক্রিয় সমাধান তৈরির তার ক্ষমতা প্রমাণ করে। তিনি সর্বদা নতুন চ্যালেঞ্জ গ্রহণ করতে এবং উদ্ভাবনী ওয়েব অভিজ্ঞতা তৈরি করতে আগ্রহী।";
  } else if (lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("hire me") || lowerCaseMessage.includes("get in touch")) {
    return `আপনি সহজেই সঞ্জয় দাসের সাথে যোগাযোগ করতে পারেন। তার ইমেল হলো **im.the.devil.god2067@gmail.com** এবং তার ফোন নম্বর হলো **+880 1727 503540**। তিনি ঢাকা, বাংলাদেশে অবস্থিত এবং নতুন সুযোগের জন্য উন্মুক্ত। আপনি তার ওয়েবসাইটের মাধ্যমে সরাসরি একটি বার্তা পাঠাতে পারেন! এখানে তার কিছু সোশ্যাল মিডিয়া লিংক রয়েছে: ${socialLinks}`;
  } else if (lowerCaseMessage.includes("about sanjay") || lowerCaseMessage.includes("about you")) {
    return "সঞ্জয় দাস একজন নিবেদিতপ্রাণ এবং ফলাফল-ভিত্তিক জুনিয়র ওয়েব ডেভেলপার। তিনি ডাইনামিক, রেসপনসিভ এবং ব্যবহারকারী-বান্ধব ওয়েব অ্যাপ্লিকেশন তৈরিতে আগ্রহী। ওয়েব ডেভেলপমেন্টে তার যাত্রা একটি শক্তিশালী কৌতূহল দিয়ে শুরু হয়েছিল, যা দক্ষ এবং পরিমাপযোগ্য সমাধান তৈরির প্রতিশ্রুতির দিকে বিকশিত হয়েছে। তিনি পরিষ্কার, সিমেন্টিক কোড এবং আধুনিক ডিজাইন নীতিগুলির উপর মনোযোগ দেন।";
  } else if (lowerCaseMessage.includes("education") || lowerCaseMessage.includes("study")) {
    return "সঞ্জয় নটরডেম কলেজ, ঢাকা (2020-2022) থেকে তার **উচ্চ মাধ্যমিক স্কুল সার্টিফিকেট (HSC)** সম্পন্ন করেছেন, যেখানে তার প্রধান বিষয় ছিল বিজ্ঞান। তিনি হাই স্কুল, ঢাকা (2024-2025) থেকে তার **মাধ্যমিক স্কুল সার্টিফিকেট (SSC)** সম্পন্ন করেছেন, যেখানে তিনি বিজ্ঞান গ্রুপে 4.06 GPA অর্জন করেছেন। তিনি ক্রমাগত শিখছেন এবং তার একাডেমিক পটভূমিকে বাস্তব-বিশ্বের ডেভেলপমেন্ট চ্যালেঞ্জগুলিতে প্রয়োগ করছেন।";
  } else if (lowerCaseMessage.includes("location") || lowerCaseMessage.includes("where are you")) {
    return "সঞ্জয় দাস বর্তমানে **ঢাকা, বাংলাদেশে** অবস্থান করছেন।";
  } else if (lowerCaseMessage.includes("date of birth") || lowerCaseMessage.includes("birthday")) {
    return "সঞ্জয়ের জন্ম তারিখ হলো **20 জুন 2007**।";
  } else if (lowerCaseMessage.includes("experience")) {
    return "সঞ্জয়ের ওয়েব ডেভেলপমেন্টে **1 বছরেরও বেশি অভিজ্ঞতা** রয়েছে, যা রেসপনসিভ ওয়েব অ্যাপ্লিকেশন তৈরিতে কেন্দ্র করে। তিনি **3+ প্রকল্প** সম্পন্ন করেছেন এবং উচ্চ ক্লায়েন্ট সন্তুষ্টির লক্ষ্য রাখেন। তার অভিজ্ঞতা তাকে বিভিন্ন চ্যালেঞ্জ মোকাবেলায় সহায়তা করেছে।";
  } else if (lowerCaseMessage.includes("thank you") || lowerCaseMessage.includes("thanks")) {
    return "আপনাকে স্বাগতম! সঞ্জয় বা তার কাজ সম্পর্কে আপনার আর কিছু জানার আছে কি? আমি এখানে সাহায্য করার জন্য আছি।";
  } else if (lowerCaseMessage.includes("bye") || lowerCaseMessage.includes("goodbye")) {
    return "বিদায়! সঞ্জয়ের পোর্টফোলিওতে আসার জন্য ধন্যবাদ। আপনার দিনটি শুভ হোক!";
  } else if (lowerCaseMessage.includes("help") || lowerCaseMessage.includes("সাহায্য")) {
    return `আমি আপনাকে আমার কন্টাক্ট লিস্ট দিতে পারি। সঞ্জয়ের সাথে যোগাযোগের জন্য এই লিংকগুলো ব্যবহার করতে পারেন: ${socialLinks} আপনার আর কোনো প্রশ্ন থাকলে জিজ্ঞাসা করতে পারেন।`;
  } else {
    return "আমি দুঃখিত, আমি একটি সাধারণ বট এবং এই নির্দিষ্ট প্রশ্নটি বুঝতে পারছি না। আমি আপনাকে সঞ্জয়ের **দক্ষতা**, **প্রকল্প**, **শিক্ষা**, **যোগাযোগ** তথ্য, অথবা তার সম্পর্কে আরও কিছু জানাতে পারি। অনুগ্রহ করে এই বিষয়গুলির মধ্যে একটি জিজ্ঞাসা করার চেষ্টা করুন।";
  }
}

// Toggle Chat Bot visibility
chatToggleBtn.addEventListener("click", () => {
  chatBotOpen = !chatBotOpen;
  if (chatBotOpen) {
    chatBotContainer.classList.add("show");
    chatInput.focus(); // Focus on input when chat opens
  } else {
    chatBotContainer.classList.remove("show");
  }
});

// Close Chat Bot
closeChatBtn.addEventListener("click", () => {
  chatBotOpen = false;
  chatBotContainer.classList.remove("show");
});

// Send Message
sendMessageBtn.addEventListener("click", () => {
  const userMessage = chatInput.value.trim();
  if (userMessage) {
    addMessage(userMessage, "user");
    chatInput.value = ""; // Clear input
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      addMessage(botResponse, "bot");
    }, 500);
  }
});

// Send message on Enter key press
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessageBtn.click(); // Simulate a click on the send button
  }
});

// Keep chat button visible and remove scroll-to-top functionality
if (chatToggleBtn) {
  // We no longer need to check scroll position to show/hide it,
  // as it's meant to be always visible and toggle the chat.
  // The original scroll-to-top button display logic is removed.
        }
