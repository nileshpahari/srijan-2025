import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  branch: string;
  skills: string[];
  bio: string;
  linkedin?: string;
  github?: string;
  hackathons?: {
    name: string;
    position: string;
    project: string;
    description: string;
    team: string[];
  }[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: false, default: '' },
  branch: { type: String, required: false, default: '' },
  skills: [{ type: String }],
  bio: { type: String, default: '' },
  linkedin: { type: String },
  github: { type: String },
  hackathons: [{
    name: { type: String },
    position: { type: String },
    project: { type: String },
    description: { type: String },
    team: [{ type: String }]
  }],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);