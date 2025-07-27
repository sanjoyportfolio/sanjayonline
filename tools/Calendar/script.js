document.addEventListener('DOMContentLoaded', () => {
    const currentMonthYearDisplay = document.getElementById('currentMonthYear');
    const daysGrid = document.getElementById('daysGrid'); // This is the main container for day cells
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const todayBtn = document.getElementById('todayBtn');
    const addEventBtn = document.getElementById('addEventBtn');

    // Add Event Modal elements
    const addEventModal = document.getElementById('eventModal');
    const closeAddEventModalBtn = document.getElementById('closeAddEventModal');
    const eventForm = document.getElementById('eventForm');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDateInput = document.getElementById('eventDate');
    const eventTimeInput = document.getElementById('eventTime');
    const eventDescriptionInput = document.getElementById('eventDescription');

    // Event Details Modal elements
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    const closeDetailsModalBtn = document.getElementById('closeDetailsModal');
    const detailsTitle = document.getElementById('detailsTitle');
    const detailsDate = document.getElementById('detailsDate');
    const detailsTime = document.getElementById('detailsTime');
    const detailsDescription = document.getElementById('detailsDescription');
    const editEventBtn = document.getElementById('editEventBtn');
    const deleteEventBtn = document.getElementById('deleteEventBtn');

    const monthViewBtn = document.getElementById('monthViewBtn');
    const weekViewBtn = document.getElementById('weekViewBtn');
    const dayViewBtn = document.getElementById('dayViewBtn');

    let currentDate = new Date();
    let currentView = 'month'; // 'month', 'week', 'day'

    // Simulate storing events (in a real app, this would be a database)
    let events = [
        { id: 1, title: "Project Meeting", date: "2025-07-10", time: "10:00", description: "Team meeting with stakeholders.", type: "work" },
        { id: 2, title: "Birthday Party", date: "2025-07-26", time: "14:30", description: "Friend's birthday party at the park. Don't forget the gift!", type: "birthday" },
        { id: 3, title: "Doctor's Appointment", date: "2025-07-05", time: "11:00", description: "Dentist appointment for check-up.", type: "personal" },
        { id: 4, title: "Grocery Shopping", date: "2025-07-28", time: "16:00", description: "Weekly shopping list: milk, eggs, bread, vegetables, fruits.", type: "other" },
        { id: 5, title: "Prepare Presentation", date: "2025-08-01", time: "09:00", description: "For new project launch. Review slides and practice delivery.", type: "work" },
    ];
    let eventIdCounter = events.length + 1;
    let selectedEventId = null; // To keep track of which event is currently displayed in details modal

    const weekdaysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsEn = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // --- Helper Functions for Smooth Transitions & Animations ---

    /**
     * Shows a modal with CSS transition.
     * @param {HTMLElement} modalElement - The modal DOM element.
     */
    function showModal(modalElement) {
        if (!modalElement) return;
        modalElement.style.display = 'flex'; // Make it visible to start transition
        requestAnimationFrame(() => {
            modalElement.classList.add('modal-active'); // Triggers opacity/transform
        });
    }

    /**
     * Hides a modal with CSS transition.
     * @param {HTMLElement} modalElement - The modal DOM element.
     */
    function hideModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.remove('modal-active'); // Triggers opacity/transform back
        // Wait for the transition to end before setting display: none
        modalElement.addEventListener('transitionend', function handler() {
            modalElement.style.display = 'none';
            modalElement.removeEventListener('transitionend', handler);
        }, { once: true });
    }

    // --- Calendar Rendering Functions ---
    function renderCalendar() {
        // Add fade-out class to daysGrid to trigger CSS animation
        daysGrid.classList.add('fade-out-content');

        // Wait for the fade-out transition to complete before changing content
        // This relies on a CSS transition on .days-grid for 'opacity'
        daysGrid.addEventListener('transitionend', function handleTransitionEnd() {
            // Remove the event listener to prevent it from firing multiple times
            daysGrid.removeEventListener('transitionend', handleTransitionEnd);

            // Now perform the actual DOM updates within requestAnimationFrame
            requestAnimationFrame(() => {
                // Ensure the weekdays header is visible for month view and hidden for others
                const weekdaysHeader = document.querySelector('.weekdays-header');
                if (currentView === 'month') {
                    weekdaysHeader.style.display = 'grid';
                } else {
                    weekdaysHeader.style.display = 'none';
                }

                if (currentView === 'month') {
                    renderMonthView();
                } else if (currentView === 'week') {
                    renderWeekView();
                } else if (currentView === 'day') {
                    renderDayView();
                }

                addEventsToCells(); // Re-populate events for the new view

                // Update month/year display
                updateRealTimeInfo();

                // Remove fade-out and add fade-in class for smooth appearance
                daysGrid.classList.remove('fade-out-content');
                daysGrid.classList.add('fade-in-content'); // Add this for entry animation

                // Remove fade-in class after its transition
                daysGrid.addEventListener('transitionend', function handleFadeInEnd() {
                    daysGrid.classList.remove('fade-in-content');
                    daysGrid.removeEventListener('transitionend', handleFadeInEnd);
                }, { once: true });
            });
        }, { once: true });
    }


    function renderMonthView() {
        daysGrid.innerHTML = ''; // Clear previous content
        daysGrid.style.gridTemplateColumns = 'repeat(7, 1fr)'; // Ensure grid is 7 columns for month view

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get the first day of the month
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstWeekday = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        let monthHtml = '';

        // Calculate days from previous month to show
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstWeekday; i > 0; i--) {
            const day = prevMonthLastDay - i + 1;
            monthHtml += createDayCellHtml(day, 'inactive');
        }

        // Render current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            monthHtml += createDayCellHtml(day, '', dateString);
        }

        // Render days from next month to fill the grid
        const totalCellsAfterCurrentMonth = firstWeekday + daysInMonth;
        const minCells = 5 * 7; // At least 5 full weeks
        const maxCells = 6 * 7; // Up to 6 full weeks (for months that spill into 6th week)

        let cellsNeeded = Math.max(minCells, totalCellsAfterCurrentMonth); // Start with at least 5 weeks
        if (totalCellsAfterCurrentMonth > 5 * 7) { // If it spills into the 6th week, use 6 full weeks
            cellsNeeded = maxCells;
        }

        const remainingCells = cellsNeeded - totalCellsAfterCurrentMonth;
        for (let i = 1; i <= remainingCells; i++) {
            monthHtml += createDayCellHtml(i, 'inactive');
        }

        daysGrid.innerHTML = monthHtml; // Update DOM once
    }

    function renderWeekView() {
        daysGrid.innerHTML = '';
        daysGrid.style.gridTemplateColumns = '1fr'; // Single column for week view, each day is a row

        let weekHtml = '';
        const startOfWeek = new Date(currentDate);
        // Go to Sunday of the current week (Sunday is 0, Monday is 1, etc.)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const dateString = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;

            let classes = ['day-cell', 'week-day-cell'];
            if (isToday(day)) {
                classes.push('today');
            }

            weekHtml += `
                <div class="${classes.join(' ')}" data-date="${dateString}">
                    <div class="week-day-header">
                        <span class="weekday-name">${weekdaysEn[day.getDay()]}</span>
                        <span class="day-number">${day.getDate()}</span>
                    </div>
                    <div class="events-list">
                        </div>
                </div>
            `;
        }
        daysGrid.innerHTML = weekHtml; // Update DOM once
    }

    function renderDayView() {
        daysGrid.innerHTML = '';
        daysGrid.style.gridTemplateColumns = '1fr';

        let dayHtml = '';
        const day = new Date(currentDate);
        const dateString = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;

        let classes = ['day-cell', 'full-day-cell'];
        if (isToday(day)) {
            classes.push('today');
        }

        dayHtml += `
            <div class="${classes.join(' ')}" data-date="${dateString}">
                <div class="day-view-header">
                    <span class="weekday-name">${weekdaysEn[day.getDay()]}</span>,
                    <span class="day-number">${day.getDate()}</span> ${monthsEn[day.getMonth()]}
                </div>
                <div class="events-list">
                    </div>
            </div>
        `;
        daysGrid.innerHTML = dayHtml; // Update DOM once
    }

    /**
     * Creates the HTML string for a day cell to minimize DOM manipulations.
     */
    function createDayCellHtml(dayNumber, classes = '', dateString = '') {
        let classList = ['day-cell'];
        if (classes) {
            classList.push(classes);
        }
        let dataAttribute = '';
        if (dateString) {
            dataAttribute = `data-date="${dateString}"`;
            const today = new Date();
            if (dateString === `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`) {
                classList.push('today');
            }
        }
        return `
            <div class="${classList.join(' ')}" ${dataAttribute}>
                <div class="day-number">${dayNumber}</div>
                <div class="events-list"></div>
            </div>
        `;
    }

    function addEventsToCells() {
        // Iterate over existing day cells and add events
        document.querySelectorAll('.day-cell[data-date]').forEach(cell => {
            const date = cell.getAttribute('data-date');
            const dayEvents = events.filter(event => event.date === date);
            const eventsListDiv = cell.querySelector('.events-list');

            if (eventsListDiv) {
                eventsListDiv.innerHTML = ''; // Clear previous events
                dayEvents.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event', event.type);
                    eventDiv.setAttribute('data-event-id', event.id);
                    eventDiv.innerHTML = `<strong>${event.time ? event.time + ' - ' : ''}</strong>${event.title}`;

                    eventDiv.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent potential parent clicks
                        showEventDetails(event.id);
                    });
                    eventsListDiv.appendChild(eventDiv);
                });
            }
        });
    }

    // Function to display event details modal
    function showEventDetails(eventId) {
        const event = events.find(e => e.id === eventId);
        if (event) {
            selectedEventId = eventId; // Store for potential edit/delete actions
            detailsTitle.textContent = event.title;
            detailsDate.textContent = event.date;
            detailsTime.textContent = event.time || 'N/A';
            detailsDescription.textContent = event.description || 'No description provided.';
            showModal(eventDetailsModal);
        }
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    // Function to update the display with real-time date/time
    function updateRealTimeInfo() {
        const now = new Date();
        let realTimeDisplay = '';

        if (currentView === 'day') {
            const dayName = weekdaysEn[now.getDay()];
            const day = now.getDate();
            const monthName = monthsEn[now.getMonth()];
            const year = now.getFullYear();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            realTimeDisplay = `${dayName}, ${day} ${monthName} ${year} - ${hours}:${minutes}:${seconds}`;
        } else if (currentView === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            realTimeDisplay = `Week of ${monthsEn[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthsEn[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        } else { // Month view
            const monthName = monthsEn[currentDate.getMonth()];
            const year = currentDate.getFullYear();
            realTimeDisplay = `${monthName} ${year}`;
        }

        currentMonthYearDisplay.textContent = realTimeDisplay;
    }

    // --- Event Listeners ---

    prevMonthBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
        } else if (currentView === 'day') {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (currentView === 'day') {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        renderCalendar();
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
        // Add a subtle highlight to the header or today button
        todayBtn.classList.add('today-highlight');
        setTimeout(() => {
            todayBtn.classList.remove('today-highlight');
        }, 500); // Match CSS animation duration
    });

    // Event Add Modal Listeners
    addEventBtn.addEventListener('click', () => {
        showModal(addEventModal);
        // Optionally pre-fill date if a day cell was clicked
        eventDateInput.value = formatDateForInput(currentDate);
        eventTitleInput.value = '';
        eventTimeInput.value = '';
        eventDescriptionInput.value = '';
    });

    closeAddEventModalBtn.addEventListener('click', () => {
        hideModal(addEventModal);
    });

    window.addEventListener('click', (event) => {
        if (event.target === addEventModal) {
            hideModal(addEventModal);
        }
        if (event.target === eventDetailsModal) {
            hideModal(eventDetailsModal);
        }
    });

    eventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = eventTitleInput.value;
        const date = eventDateInput.value;
        const time = eventTimeInput.value;
        const description = eventDescriptionInput.value;
        const type = 'other'; // Default type, can be selected in modal later

        const newEvent = {
            id: eventIdCounter++,
            title,
            date,
            time,
            description,
            type
        };
        events.push(newEvent);
        hideModal(addEventModal);
        renderCalendar(); // Re-render calendar to show new event
    });

    // Event Details Modal Listeners
    closeDetailsModalBtn.addEventListener('click', () => {
        hideModal(eventDetailsModal);
    });

    editEventBtn.addEventListener('click', () => {
        if (selectedEventId) {
            // In a real app, you'd fetch the event by selectedEventId
            // and pre-fill the addEventModal for editing.
            const eventToEdit = events.find(e => e.id === selectedEventId);
            if (eventToEdit) {
                eventTitleInput.value = eventToEdit.title;
                eventDateInput.value = eventToEdit.date;
                eventTimeInput.value = eventToEdit.time;
                eventDescriptionInput.value = eventToEdit.description;
                // You might need to change form's submit behavior to update instead of add
                // For now, let's just open the add event modal with pre-filled data
                showModal(addEventModal);
                hideModal(eventDetailsModal); // Close details modal
                // alert(`Editing event with ID: ${selectedEventId}`); // Temporarily for testing
            }
        }
    });

    deleteEventBtn.addEventListener('click', () => {
        if (selectedEventId && confirm('Are you sure you want to delete this event?')) {
            events = events.filter(event => event.id !== selectedEventId);
            hideModal(eventDetailsModal);
            renderCalendar(); // Re-render after deletion
        }
    });


    // View Toggles
    monthViewBtn.addEventListener('click', () => {
        currentView = 'month';
        monthViewBtn.classList.add('active');
        weekViewBtn.classList.remove('active');
        dayViewBtn.classList.remove('active');
        renderCalendar();
    });

    weekViewBtn.addEventListener('click', () => {
        currentView = 'week';
        weekViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        dayViewBtn.classList.remove('active');
        renderCalendar();
    });

    dayViewBtn.addEventListener('click', () => {
        currentView = 'day';
        dayViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        weekViewBtn.classList.remove('active');
        renderCalendar();
    });

    // Helper to format date for input[type="date"]
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Set up real-time clock update for day view
    setInterval(() => {
        // Only update if currentView is 'day' AND the date displayed is today's date
        // This prevents the clock from updating if the user is looking at a past/future day in day view
        const displayedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        if (currentView === 'day' && isToday(displayedDate)) {
            updateRealTimeInfo();
        }
    }, 1000);

    // Initial render
    // Trigger initial render after DOM is ready
    renderCalendar();
    // Set initial active view button
    monthViewBtn.classList.add('active');
});