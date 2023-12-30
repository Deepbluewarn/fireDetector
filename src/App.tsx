import { useEffect, useState } from 'react';
import SensorNode from './Interface/SensorNode';
import { Card, CardActions, CardContent, Chip, Grid, Stack, ThemeProvider, Typography, createTheme } from '@mui/material';
import mqtt from 'mqtt';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Pretendard Variable',
      'sans-serif',
    ].join(','),
  },
});
const clientId = 'emqx_nodejs_' + Math.random().toString(16).substring(2, 8)

const client = mqtt.connect('wss://fbb1763c.ala.us-east-1.emqxsl.com:8084/mqtt', {
  clientId,
  username: import.meta.env.VITE_MQTT_USERNAME,
  password: import.meta.env.VITE_MQTT_PASSWORD,
});
let clientInit = false;

function App() {
  const [node, setNode] = useState<Map<string, SensorNode>>(new Map());

  // id 기준으로 정렬한 다음 출력하는 코드
  const list = Array.from(node.values()).sort((a, b) => {
    return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
  }).map((node) => {
    return (
      <Grid item key={node.id}>
        <Card sx={{ 
          border: node.fireDetected ? 'solid 4px #f44336' : 'none',
          width: 200,
        }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              {node.name}
            </Typography>
            <Typography variant="h5" component="div">
              {
                node.fireDetected ? '🔥화재 발생🔥' : '화재 감지 안됨.'
              }
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {node.temperature}℃ / {node.humidity}%
            </Typography>
            <Typography variant="body2">
              {node.movementDetected ? '음직임이 감지 됨.' : ''}
              <br />
              센서 배터리 잔량: {node.battery}%
            </Typography>
          </CardContent>
          <CardActions>
            {
              node.checkResult ?
                <Chip label="점검 성공" color="primary" /> :
                <Chip label="점검 필요" color="error" />
            }

          </CardActions>
        </Card>
      </Grid>
    )
  });

  useEffect(() => {
    if (clientInit) return;

    client.on('connect', () => {
      client.subscribe("fire_detector", () => {
        console.log('fire_detector subscribed.');
      });
    });

    client.on("message", (topic, message) => {
      if(topic !== 'fire_detector') return;
      const data = JSON.parse(message.toString());

      setNode((prev) => {
        const newNode = new Map(prev);
        newNode.set(data.id, data);
        return newNode;
      });
    });

    clientInit = true;

    return () => {
      client.end();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Stack gap={2} sx={{ padding: 4 }}>
        <Typography variant="h4" component="div">
          🔥🔥화재 감지 시스템🔥🔥
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          건물 내 화재 현황을 실시간으로 확인할 수 있습니다.
        </Typography>
        <Grid
          container
          spacing={4}
          alignItems={'center'}
        >
          {list}
        </Grid>
      </Stack>
    </ThemeProvider>
  )
}

export default App
