import mongoose, { Schema, Document } from 'mongoose';

interface Warning {
  Moderator: string;
  Reason: string;
  Date: Date;
  Case: number;
}

interface WarningsDocument extends Document {
  Guild: string;
  User: string;
  Warnings: Warning[];
}

const WarningsSchema: Schema = new Schema({
  Guild: String,
  User: String,
  Warnings: [{
    Moderator: String,
    Reason: String,
    Date: Date,
    Case: Number,
  }],
});

const WarningsModel = mongoose.model<WarningsDocument>('warnings', WarningsSchema);

async function addWarning(guildId: string, userId: string, moderatorId: string, reason: string, caseNumber: number): Promise<void> {
  try {
    const warning: Warning = {
      Moderator: moderatorId,
      Reason: reason,
      Date: new Date(),
      Case: caseNumber,
    };

    const existingWarnings = await WarningsModel.findOne({ Guild: guildId, User: userId });

    if (existingWarnings) {
      existingWarnings.Warnings.push(warning);
      await existingWarnings.save();
    } else {
      await WarningsModel.create({
        Guild: guildId,
        User: userId,
        Warnings: [warning],
      });
    }

    console.log('Warning added successfully.');
  } catch (error) {
    console.error('Error adding warning:', error);
    throw error;
  }
}

export { WarningsModel, addWarning };