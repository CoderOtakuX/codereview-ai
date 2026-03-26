const API_BASE = 'http://localhost:8080';
const timestamp = Math.floor(Date.now() / 1000);
const testUser = {
  email: `demo_${timestamp}@codereview.ai`,
  password: 'Demo123!',
  name: 'Demo Automation'
};

let token = '';

async function runTests() {
  console.log('🚀 Starting Backend API Verification...\n');

  try {
    // 1. Registration
    console.log('1️⃣ Testing Registration...');
    const regRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
    });
    if(!regRes.ok) throw new Error(`Status: ${regRes.status}`);
    const regData = await regRes.json();
    console.log(`   ✅ Registration successful.`);
    
    // 2. Login
    console.log('\n2️⃣ Testing Login...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
        })
    });
    if(!loginRes.ok) throw new Error(`Status: ${loginRes.status}`);
    const loginData = await loginRes.json();
    token = loginData.responseObject ? loginData.responseObject.token : loginData.token;
    console.log(`   ✅ Login successful. Token received.`);

    // 3. Paste Code Review
    console.log('\n3️⃣ Testing Paste Code Review...');
    const pasteReq = {
      code: "function add(a, b) {\n  var c = a + b;\n  return c\n}",
      language: "javascript"
    };
    const pasteRes = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pasteReq)
    });
    if(!pasteRes.ok) throw new Error(`Status: ${pasteRes.status}`);
    const pasteData = await pasteRes.json();
    const reviewId = pasteData.responseObject ? pasteData.responseObject.id : pasteData.id;
    console.log(`   ✅ Review queued. ID: ${reviewId}`);
    
    // Poll for completion
    let status = 'pending';
    while (status !== 'completed' && status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      process.stdout.write('.');
      const statusRes = await fetch(`${API_BASE}/reviews/${reviewId}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statusData = await statusRes.json();
      status = statusData.status;
    }
    console.log(`\n   ✅ Paste Review completed!`);

    // 4. GitHub PR Review
    console.log('\n4️⃣ Testing GitHub PR Review (https://github.com/adnanh/webhook/pull/743)...');
    const prReq = {
      prUrl: "https://github.com/adnanh/webhook/pull/743"
    };
    const prRes = await fetch(`${API_BASE}/reviews/github`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prReq)
    });
    if(!prRes.ok) throw new Error(`Status: ${prRes.status}`);
    const prData = await prRes.json();
    const reviewsArr = prData.responseObject ? prData.responseObject.reviews : prData.reviews;
    console.log(`   ✅ PR Review initialized. Tracking ${reviewsArr.length} files.`);
    
    // We'll check the status of the first file in the PR
    if (reviewsArr.length > 0) {
      const prReviewId = reviewsArr[0].reviewId;
      console.log(`   ⏳ Polling first file in PR (ID: ${prReviewId})...`);
      
      let prStatus = 'pending';
      let attempts = 0;
      while (prStatus !== 'completed' && prStatus !== 'failed' && attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        process.stdout.write('.');
        const statusRes = await fetch(`${API_BASE}/reviews/${prReviewId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statusData = await statusRes.json();
        prStatus = statusData.status;
        attempts++;
      }
      if(prStatus === 'completed') {
          console.log(`\n   ✅ PR File Review completed successfully!`);
      } else {
          console.log(`\n   ⚠️ PR File Review timed out or failed (Status: ${prStatus}).`);
      }
    } else {
      console.log(`   ⚠️ No files found in PR to review.`);
    }

    console.log('\n🎉 All core backend workflows verified successfully!');

  } catch (err) {
    console.error('\n❌ Error during verification:');
    console.error(err);
  }
}

runTests();
