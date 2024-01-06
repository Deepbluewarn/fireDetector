export default interface SensorNode {
    id: number;
    name: string;
    temperature: number;
    humidity: number;
    fireDetected: boolean;
    movementDetectedTime?: number;
    checkResult?: boolean; // 센서 동작 점검 결과
}