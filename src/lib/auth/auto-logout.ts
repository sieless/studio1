/**
 * Auto-Logout Functionality
 * Automatically logs out users after 20 minutes of inactivity
 * Shows warning at 18 minutes
 */

export const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds
export const WARNING_TIMEOUT = 18 * 60 * 1000; // 18 minutes in milliseconds

export type InactivityCallback = () => void;

class InactivityMonitor {
  private timeout: NodeJS.Timeout | null = null;
  private warningTimeout: NodeJS.Timeout | null = null;
  private warningCallback: InactivityCallback | null = null;
  private logoutCallback: InactivityCallback | null = null;
  private isMonitoring = false;

  // Events that indicate user activity
  private activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ];

  /**
   * Start monitoring user activity
   */
  start(onWarning: InactivityCallback, onLogout: InactivityCallback) {
    if (this.isMonitoring) {
      return; // Already monitoring
    }

    this.warningCallback = onWarning;
    this.logoutCallback = onLogout;
    this.isMonitoring = true;

    // Set up activity listeners
    this.activityEvents.forEach(event => {
      window.addEventListener(event, this.resetTimer);
    });

    // Start the timer
    this.resetTimer();
  }

  /**
   * Stop monitoring user activity
   */
  stop() {
    this.isMonitoring = false;

    // Remove activity listeners
    this.activityEvents.forEach(event => {
      window.removeEventListener(event, this.resetTimer);
    });

    // Clear timers
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
  }

  /**
   * Reset the inactivity timer (called on user activity)
   */
  private resetTimer = () => {
    // Clear existing timers
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }

    // Set warning timer (18 minutes)
    this.warningTimeout = setTimeout(() => {
      if (this.warningCallback) {
        this.warningCallback();
      }
    }, WARNING_TIMEOUT);

    // Set logout timer (20 minutes)
    this.timeout = setTimeout(() => {
      if (this.logoutCallback) {
        this.logoutCallback();
      }
      this.stop(); // Stop monitoring after logout
    }, INACTIVITY_TIMEOUT);
  };

  /**
   * Manually trigger logout (e.g., when user clicks "Logout now" in warning)
   */
  triggerLogout() {
    if (this.logoutCallback) {
      this.logoutCallback();
    }
    this.stop();
  }

  /**
   * Dismiss warning and reset timer
   */
  dismissWarning() {
    this.resetTimer();
  }
}

// Singleton instance
export const inactivityMonitor = new InactivityMonitor();
