const express = require('express');
const axios = require('axios');

const API_URL = 'https://api.subquery.network/sq/AstarStats/astarstats-aggregate-block-data';
const app = express();
const port = process.env.PORT || 3000;

app.get('/blockdata/daily/30days', async (req, res) => {
  const data = await getDailyData();
  let csv = 'Date, NativeActiveUsersCount, EVMActiveUsersCount\n';
  data.map(item => {
    csv += `${item.id}, ${item.nativeActiveUsers.length}, ${item.evmActiveUsers.length}` + '\n';
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('daily.csv');
  return res.send(csv);
});

app.get('/blockdata/daily-unique/30days', async (req, res) => {
  const data = await getDailyData();
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

  res.send({
    nativeUniqueCount: native.size,
    evmUniqueCount: evm.size
  });
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

const getDailyData = async () => {
  const result = await axios.post(API_URL, {
    query: 'query { dailyCounts (last:30, orderBy:ID_ASC) { nodes { id, nativeActiveUsers, evmActiveUsers} } }'
  });
  return result.data.data.dailyCounts.nodes;
}

app.listen(port, () => {
  console.log(`The server is  listening on port ${port}`)
})