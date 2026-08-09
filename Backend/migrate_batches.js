import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const batchSchema = new mongoose.Schema({
  name: String,
  className: String,
  instituteId: mongoose.Schema.Types.ObjectId,
}, { strict: false });

const Batch = mongoose.model('Batch', batchSchema);

async function run() {
  const batches = await Batch.find({});
  console.log("All batches before migration:");
  batches.forEach(b => console.log(`- ID: ${b._id}, Name: ${b.name}, ClassName: ${b.className || 'none'}`));
  
  // Find batches that have MHT CET in their name or should be in MHT CET
  for (const b of batches) {
    if (!b.className || b.className === 'General Class') {
      // User says: "MOVE ALL OTHER THREE MHT CET GENRAL CLASS DIVISONS TO TEH mht cET AS PER THERI NAEM THEY ARE IN THAT"
      // I will move anything with "CET" or "MHT" in the name to "MHT CET"
      if (b.name.toLowerCase().includes('cet') || b.name.toLowerCase().includes('mht')) {
        console.log(`Updating batch ${b.name} to className MHT CET`);
        b.className = 'MHT CET';
        await b.save();
      }
    }
  }

  // Double check
  const updated = await Batch.find({});
  console.log("\nAll batches after migration:");
  updated.forEach(b => console.log(`- ID: ${b._id}, Name: ${b.name}, ClassName: ${b.className || 'none'}`));

  process.exit(0);
}

run();
