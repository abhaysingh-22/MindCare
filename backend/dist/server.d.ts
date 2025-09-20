declare class MindCareServer {
    private app;
    private server;
    private io;
    private database;
    private musicService;
    private moodService;
    private streamingService;
    constructor();
    private setupDatabase;
    private setupServices;
    private setupMiddleware;
    private setupRoutes;
    private setupWebSocket;
    private setupScheduledTasks;
    start(): void;
    shutdown(): Promise<void>;
}
export default MindCareServer;
//# sourceMappingURL=server.d.ts.map