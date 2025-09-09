export interface ISendPushNotification {
  token: string;
  title: string;
  body: string;
  data: Record<string, string>;
}
