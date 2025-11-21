import type { Ingredient } from '../types';

interface SpoilageInfo {
    daysLeft: number;
    isUrgent: boolean;
    isExpired: boolean;
}

/**
 * Calculates the remaining days until an ingredient spoils based on its purchase date and spoilage time string.
 * @param purchaseDate - The date of purchase in 'YYYY-MM-DD' format.
 * @param spoilageTime - A string like "3-5 días", "1 semana", "10 days".
 * @returns An object with days left, urgency, and expiration status. Returns null if parsing fails.
 */
export const calculateSpoilageInfo = (purchaseDate: string, spoilageTime: string): SpoilageInfo | null => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize current date to the beginning of the day

    // The purchase date comes in YYYY-MM-DD, but the Date constructor might interpret it as UTC midnight.
    // To avoid timezone issues, we create the date by specifying year, month, and day in local time.
    const dateParts = purchaseDate.split('-').map(Number);
    const startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    startDate.setHours(0, 0, 0, 0); // Normalize start date

    const match = spoilageTime.match(/(\d+)(?:\s*-\s*(\d+))?/);
    if (!match) return null;

    let minDays = parseInt(match[1], 10);
    let maxDays = match[2] ? parseInt(match[2], 10) : minDays;

    if (spoilageTime.toLowerCase().includes('semana')) {
        minDays *= 7;
        maxDays *= 7;
    }
    
    // We use the minimum days for the alert, as it's the worst-case scenario.
    const expiryDate = new Date(startDate);
    expiryDate.setDate(startDate.getDate() + minDays);
    
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return {
        daysLeft: daysLeft,
        isUrgent: daysLeft <= 3 && daysLeft >= 0,
        isExpired: daysLeft < 0,
    };
};
