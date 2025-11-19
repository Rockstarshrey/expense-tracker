#!/usr/bin/env node
/**
 * Quick test script to verify MongoDB connectivity
 * Run with: node test-connection.js
 */

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing MongoDB Connection\n');

  try {
    // Test health endpoint
    console.log('📡 Testing /api/health...');
    const health = await makeRequest('/api/health');
    console.log(`Status: ${health.status}`);
    console.log(`Connected: ${health.data?.mongodb?.connected}`);
    console.log(`Response Time: ${health.data?.timing?.totalResponseMs}ms`);
    console.log('');

    if (health.status === 200 && health.data?.mongodb?.connected) {
      console.log('✅ MongoDB connection is working!');
      console.log(`Database: ${health.data?.mongodb?.database}`);
      console.log(`Host: ${health.data?.mongodb?.host}`);
    } else {
      console.log('❌ MongoDB connection failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
