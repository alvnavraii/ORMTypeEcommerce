// src/entity/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from 'bcrypt';
import { TimezoneUtil } from '../utils/timezone';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ name: 'password_hash', length: 255 })
    passwordHash: string;

    @Column({ name: 'first_name', length: 100 })
    firstName: string;

    @Column({ name: 'last_name', length: 100 })
    lastName: string;

    @Column({ nullable: true, length: 20 })
    phone: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'is_admin', default: false })
    isAdmin: boolean;

    @CreateDateColumn({ 
        name: 'created_at',
        type: 'timestamptz', // timestamp with timezone
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @UpdateDateColumn({ 
        name: 'updated_at',
        type: 'timestamptz', // timestamp with timezone
        default: () => 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @BeforeInsert()
    updateTimestampsOnCreate() {
        const now = TimezoneUtil.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @BeforeUpdate()
    updateTimestampsOnUpdate() {
        this.updatedAt = TimezoneUtil.now();
    }

    async setPassword(password: string): Promise<void> {
        const saltRounds = 10;
        this.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // Método para verificar contraseña
    async verifyPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.passwordHash);
    }

    // Método para hashear contraseña
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    // Métodos para formatear fechas en timezone Madrid
    getFormattedCreatedAt(): string {
        return TimezoneUtil.formatForUser(this.createdAt);
    }

    getFormattedUpdatedAt(): string {
        return TimezoneUtil.formatForUser(this.updatedAt);
    }
}
