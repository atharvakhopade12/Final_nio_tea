const supabase = require('./supabase');

const connectDB = async (retries = 12, delay = 10000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      if (error) throw error;
      console.log('✅ Supabase (PostgreSQL) Connected');
      return;
    } catch (error) {
      const msg = typeof error.message === 'string' && error.message.length < 200
        ? error.message
        : '521 / network error';
      console.error(`❌ Supabase Connection Error (attempt ${attempt}/${retries}): ${msg}`);
      if (attempt === retries) {
        console.error('⚠️  Could not reach Supabase after all retries. Is the project paused? Visit https://supabase.com/dashboard');
        return; // keep server alive so we can still serve static/other routes
      }
      console.log(`   Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
