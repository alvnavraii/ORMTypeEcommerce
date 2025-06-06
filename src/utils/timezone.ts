// src/utils/timezone.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configurar dayjs con plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Timezone por defecto
const DEFAULT_TIMEZONE = process.env.TIMEZONE || 'Europe/Madrid';

export class TimezoneUtil {
    /**
     * Obtiene la fecha actual en el timezone configurado
     */
    static now(): Date {
        return dayjs().tz(DEFAULT_TIMEZONE).toDate();
    }

    /**
     * Obtiene la fecha actual en Madrid como string ISO con timezone
     */
    static nowISO(): string {
        return dayjs().tz(DEFAULT_TIMEZONE).format();
    }

    /**
     * Convierte una fecha a ISO string en el timezone configurado
     */
    static toISO(date: Date): string {
        return dayjs(date).tz(DEFAULT_TIMEZONE).format();
    }

    /**
     * Convierte una fecha a string en el timezone configurado
     */
    static toTimezoneString(date: Date): string {
        return dayjs(date).tz(DEFAULT_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
    }

    /**
     * Convierte una fecha del timezone configurado a UTC
     */
    static toUTC(date: Date): Date {
        return dayjs.tz(date, DEFAULT_TIMEZONE).utc().toDate();
    }

    /**
     * Convierte una fecha UTC al timezone configurado
     */
    static fromUTC(date: Date): Date {
        return dayjs.utc(date).tz(DEFAULT_TIMEZONE).toDate();
    }

    /**
     * Formatea una fecha para mostrar al usuario
     */
    static formatForUser(date: Date): string {
        return dayjs(date).tz(DEFAULT_TIMEZONE).format('DD/MM/YYYY HH:mm:ss');
    }

    /**
     * Obtiene el timezone configurado
     */
    static getTimezone(): string {
        return DEFAULT_TIMEZONE;
    }

    /**
     * Crea una fecha dayjs en el timezone configurado
     */
    static createInTimezone(date?: string | Date): dayjs.Dayjs {
        return dayjs(date).tz(DEFAULT_TIMEZONE);
    }

    /**
     * Obtiene información completa de timezone para debugging
     */
    static getTimezoneInfo() {
        const now = new Date();
        const madridNow = dayjs().tz(DEFAULT_TIMEZONE);
        
        return {
            timezone: DEFAULT_TIMEZONE,
            processEnvTZ: process.env.TZ,
            nodeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            times: {
                utc: now.toISOString(),
                madrid: madridNow.format('DD/MM/YYYY HH:mm:ss'),
                madridISO: madridNow.format(), // Formato ISO con timezone
                madridOffset: madridNow.format('Z'), // Solo el offset
                localOffset: now.getTimezoneOffset()
            }
        };
    }
}
