const fetch = require('node-fetch');

async function processQueries() {
  const apiUrl = 'https://share.shub.edu.vn/api/intern-test/input'; // API lấy dữ liệu
  const outputApiUrl = 'https://share.shub.edu.vn/api/intern-test/output'; // API post kết quả

  try {
    // 1. Lấy dữ liệu từ API
    const response = await fetch(apiUrl);
    const { token, data, query } = await response.json();

    const n = data.length;
    const q = query.length;

    // 2. Tạo prefix sums
    const prefixAll = new Array(n);
    const prefixDiff = new Array(n);

    prefixAll[0] = data[0];
    prefixDiff[0] = data[0]; // index 0 là chẵn

    for (let i = 1; i < n; i++) {
      prefixAll[i] = prefixAll[i - 1] + data[i];
      prefixDiff[i] = prefixDiff[i - 1] + (i % 2 === 0 ? data[i] : -data[i]);
    }

    // 3. Xử lý query
    const results = [];

    for (const { type, range } of query) {
      const [l, r] = range;
      if (type === '1') {
        // Query loại 1: sum(l, r)
        const sum = prefixAll[r] - (l > 0 ? prefixAll[l - 1] : 0);
        results.push(sum);
      } else if (type === '2') {
        // Query loại 2: (sum even) - (sum odd)
        const diff = prefixDiff[r] - (l > 0 ? prefixDiff[l - 1] : 0);
        results.push(diff);
      }
    }

    console.log(results);

    // 4. Gửi kết quả lên API với Bearer token
    const postResponse = await fetch(outputApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ results })
    });

    if (!postResponse.ok) {
      throw new Error(`Failed to post results: ${postResponse.statusText}`);
    }

    console.log('Kết quả đã được gửi thành công:', results);
  } catch (error) {
    console.error('Có lỗi xảy ra:', error);
  }
}

processQueries();
