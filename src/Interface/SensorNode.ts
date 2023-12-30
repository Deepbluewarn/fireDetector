export default interface SensorNode {
    id: number;
    name: string;
    temperature: number;
    humidity: number;
    battery: number;
    fireDetected: boolean;
    movementDetected: boolean;
    checkResult?: boolean; // 센서 동작 점검 결과
}