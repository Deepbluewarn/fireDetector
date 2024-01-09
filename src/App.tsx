import { useEffect, useState } from 'react';
import SensorNode from './Interface/SensorNode';
import { Card, CardActions, CardContent, Chip, Grid, Stack, ThemeProvider, Typography, createTheme } from '@mui/material';
import mqtt from 'mqtt';
import TimeAgo from 'javascript-time-ago'
import ko from 'javascript-time-ago/locale/ko'
import ReactTimeAgo from 'react-time-ago';

TimeAgo.addDefaultLocale(ko);
TimeAgo.addLocale(ko);

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
          border: node.fireDetected ? 'solid 4px #f44336' : 'none', height: 300, width: 245, borderRadius: 4, padding: 2, display: 'grid', flexDirection: 'column', alignItems: 'center'
        }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              {node.name}
            </Typography>

            {node.fireDetected ? (
            <Typography variant="h5" component="div" color="red">
            화재 발생
            </Typography>
            ) : (
            <Typography variant="h5" component="div">
            화재 감지 안됨
            </Typography>
            )}

            
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {node.temperature}℃ / {node.humidity}%
            </Typography>
            <Typography variant="body2">
              {
                typeof node.movementDetectedTime !== 'undefined' ? (
                  <span>
                    <ReactTimeAgo date={node.movementDetectedTime} locale="ko"/>
                    &nbsp;에 움직임이 감지되었어요
                  </span>
                ) : (
                  null
                )
              }
              
            </Typography>
          </CardContent>
          <CardActions disableSpacing sx={{ 
                display: 'flex', alignItems: 'flex-end', alignContent: 'flex-end'
              }} >

            {
              node.checkResult ?
                <Chip label="정상 작동" color="primary" /> :
                <Chip label="점검 필요" color="error" />
            }
            <Typography 
              sx={{ 
                fontSize: 14,
                marginLeft: 'auto',
                alignSelf: 'end',
              }} 
              color="text.secondary" 
              gutterBottom
            >
              <ReactTimeAgo date={node.time} locale="ko"/>
            </Typography>
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
    <ThemeProvider theme={theme} >
      <div style={{ backgroundColor: '#810000', height: '50px', maxWidth: '100%', padding: '10px'}} >
      <Typography variant="h5" component="div" color="white" sx={{ textAlign: 'left', display: 'flex', alignContent: 'center', marginLeft: '25px'}}>
        <img src="./vite.svg" width="24" height="24" style={{ marginRight: '10px' }} />
        화재 감지 시스템
        </Typography>
      </div>

      <Typography sx={{ backgroundColor: '#f0f0f0', borderRadius: 3, padding: 1, marginLeft: '15px', marginTop: '15px', marginRight: '15px',maxWidth: '100%', height: 50, display: 'flex', alignItems: 'center', textAlign: 'center', color: 'grey', fontSize: 15, paddingLeft: 5}} >
        현재 {list.length}개의 화재 감지기가 연결되어 있어요
      </Typography>

      <Stack gap={2} sx={{ padding: 2, display: 'flex', alignContent: 'center'}}>
        <Grid container spacing={4} sx={{ backgroundColor: '#f0f0f0', borderRadius: 4, padding: 1, margin: '0 auto',  maxWidth: '100%', paddingBottom: '40px'}} >
          {
            list.length > 0 ? list : 
            (
              <Grid item>
                <Typography sx={{ fontSize: 15, textAlign: 'center', color: 'grey' }} gutterBottom>
                  화재 감지기를 연결해주세요
                </Typography>
              </Grid>
            )
          }
        </Grid>
      </Stack>
    </ThemeProvider>
  )
}

export default App
