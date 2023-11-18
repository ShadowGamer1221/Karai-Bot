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
  Case: number;
}

const WarningsSchema: Schema = new Schema({
  Guild: String,
  User: String,
  Case: Number,
  Warnings: [{
    Moderator: String,
    Reason: String,
    Date: Date,
    Case: Number,
  }],
});

const WarningsModel = mongoose.model<WarningsDocument>('warnings', WarningsSchema);

async function addWarning(guildId: string, userId: string, moderatorId: string, reason: string, Case: number): Promise<void> {
  try {
    const latestCaseNumber = Case;
    const warning: Warning = {
      Moderator: moderatorId,
      Reason: reason,
      Date: new Date(),
      Case: latestCaseNumber,
    };

    const existingWarnings = await WarningsModel.findOne({ Guild: guildId, User: userId, Case: latestCaseNumber });

    if (existingWarnings) {
      existingWarnings.Warnings.push(warning);
      await existingWarnings.save();
    } else {
      await WarningsModel.create({
        Guild: guildId,
        User: userId,
        Case: latestCaseNumber,
        Warnings: [warning],
      });
    }

    console.log('Warning added successfully.');
  } catch (error) {
    console.error('Error adding warning:', error);
    throw error;
  }
}

async function removeWarning(guildId: string, caseNumber: number): Promise<void> {
  try {
    // Find the user with the specified case number and remove it
    await WarningsModel.deleteMany({ Case: caseNumber });
    console.log(`Warning with case ID ${caseNumber} removed successfully.`);
  } catch (error) {
    console.error('Error removing warning:', error);
    throw error;
  }
}


export { WarningsModel, addWarning, removeWarning };