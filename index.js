const express = require('express');
const axios = require('axios');

const API_URL = 'https://api.subquery.network/sq/AstarStats/astarstats-aggregate-block-data';
const app = express();
const port = process.env.PORT || 3000;

app.get('/blockdata/daily/30days', async (req, res) => {
  const data = await getDailyData(30);
  let csv = 'Date, NativeActiveUsersCount, EVMActiveUsersCount\n';
  data.map(item => {
    csv += `${item.id}, ${item.nativeActiveUsers.length}, ${item.evmActiveUsers.length}` + '\n';
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('daily.csv');
  
  return res.send(csv);
});

app.get('/blockdata/daily-unique/30days', async (req, res) => {
  res.send(await getUniqueWalletsCount(30));
});

app.get('/blockdata/daily-unique/7days', async (req, res) => {
  res.send(await getUniqueWalletsCount(7));
});

app.get('/blockdata/monthly', async (req, res) => {
  const result = await axios.post(API_URL, {
    query: 'query { monthlyCounts (last:30, orderBy:ID_ASC) { nodes { id, nativeActiveUsers, evmActiveUsers} } }'
  });
  const data = result.data.data.monthlyCounts.nodes;
  let csv = 'Date, NativeActiveUsersCount, EVMActiveUsersCount\n';
  data.map(item => {
    csv += `${item.id}, ${item.nativeActiveUsers.length}, ${item.evmActiveUsers.length}` + '\n';
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('monthly.csv');

  return res.send(csv);
});

const getDailyData = async (numberOdDays) => {
  const result = await axios.post(API_URL, {
    query: `query { dailyCounts (last: ${numberOdDays}, orderBy:ID_ASC) { nodes { id, nativeActiveUsers, evmActiveUsers} } }`
  });

  return result.data.data.dailyCounts.nodes;
}

const getUniqueWalletsCount = async (numberOdDays) => {
  const data = await getDailyData(numberOdDays);
  const native = new Map();
  const evm = new Map();
  data.map(item => {
    item.nativeActiveUsers.map(x => {
      if(!native.has(x)) {
        native.set(x, 1);
      }  
    });

    item.evmActiveUsers.map(x => {
      if(!evm.has(x)) {
        evm.set(x, 1);
      }  
    });
  });

  return {
    nativeUniqueCount: native.size,
    evmUniqueCount: evm.size
  };
}

app.listen(port, () => {
  console.log(`The server is  listening on port ${port}`)
})