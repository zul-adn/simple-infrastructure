import http from 'k6/http';
import { sleep, check } from 'k6';

// test configuration
export const options = {
  vus: 10, // simulate concurrent virtual users
  duration: '30s',
  
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
    http_req_failed: ['rate<0.01']    // less than 1% request failure rate
  }
};


export default function() {
  
 
  const response = http.get('http://localhost:3001/hello'); 
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time is acceptable': (r) => r.timings.duration < 500
  });
  
  
  sleep(1);
}