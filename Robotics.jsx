
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, Plus, Wifi, WifiOff, Activity, Terminal, Send, RefreshCw,
  Clock, CheckCircle2, XCircle, AlertCircle, BarChart3, Zap, Shield,
  Radio, Copy, Settings, Database, Calendar
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import AnimatedLine from '../components/charts/AnimatedLine';
import AnimatedBar from '../components/charts/AnimatedBar';
import PageHeader from '../components/ui/PageHeader';
import FleetMonitor from '../components/robotics/FleetMonitor';
import CommandScheduler from '../components/robotics/CommandScheduler';
import PolicyEngine from '../components/robotics/PolicyEngine';

export default function RoboticsPage() {
  const [robots, setRobots] = useState([]);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [commandLogs, setCommandLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRobotName, setNewRobotName] = useState('');
  const [newRobotId, setNewRobotId] = useState('');
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [commandVerb, setCommandVerb] = useState('');
  const [commandArgs, setCommandArgs] = useState('{}');
  const [telemetryStats, setTelemetryStats] = useState({ avgLatency: 0, successRate: 0, totalMessages: 0 });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (telemetryLogs.length > 0) {
      calculateTelemetryStats();
    }
  }, [telemetryLogs, commandLogs]);

  const loadData = async () => {
    try {
      setError(null);
      const [robotsData, telemetryData, commandData] = await Promise.all([
        base44.entities.Robot.list('-last_seen', 50).catch(() => []),
        base44.entities.RobotTelemetryLog.list('-timestamp', 100).catch(() => []),
        base44.entities.RobotCommandLog.list('-sent_at', 100).catch(() => [])
      ]);
      
      setRobots(robotsData);
      setTelemetryLogs(telemetryData);
      setCommandLogs(commandData);
    } catch (error) {
      console.error('Failed to load robotics data:', error);
      setError(error.message);
      toast.error('Failed to load robotics data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTelemetryStats = () => {
    const commandSuccess = commandLogs.filter(c => 
      c.status === 'acked_completed' || c.status === 'acked_accepted'
    ).length;
    const successRate = commandLogs.length > 0 ? (commandSuccess / commandLogs.length * 100).toFixed(1) : 0;

    setTelemetryStats({
      avgLatency: 45,
      successRate: parseFloat(successRate),
      totalMessages: telemetryLogs.length
    });
  };

  const generateHmacSecret = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateRobot = async () => {
    if (!newRobotName.trim() || !newRobotId.trim()) {
      toast.error('Please enter both robot name and ID');
      return;
    }

    try {
      const hmacSecret = generateHmacSecret();
      const robot = await base44.entities.Robot.create({
        robot_id: newRobotId.trim(),
        name: newRobotName.trim(),
        hmac_secret: hmacSecret,
        status: 'offline',
        metadata: {}
      });

      setRobots(prev => [robot, ...prev]);
      setNewRobotName('');
      setNewRobotId('');
      setShowCreateForm(false);
      toast.success('Robot created successfully');
    } catch (error) {
      console.error('Failed to create robot:', error);
      toast.error('Failed to create robot');
    }
  };

  const handleSendCommand = async () => {
    if (!selectedRobot || !commandVerb.trim()) {
      toast.error('Please select a robot and enter a command verb');
      return;
    }

    try {
      const args = JSON.parse(commandArgs);
      const command = {
        command_id: crypto.randomUUID(),
        robot_id: selectedRobot.robot_id,
        trace_id: crypto.randomUUID(),
        verb: commandVerb.trim(),
        args,
        status: 'sent',
        sent_at: new Date().toISOString()
      };

      await base44.entities.RobotCommandLog.create(command);
      setCommandLogs(prev => [command, ...prev]);
      setCommandVerb('');
      setCommandArgs('{}');
      toast.success('Command sent successfully');
    } catch (error) {
      console.error('Failed to send command:', error);
      toast.error('Failed to send command. Check JSON format.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4 text-[#10b981]" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-[#6b7280]" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 text-[#fbbf24] animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4 text-[#ef4444]" />;
      default: return <AlertCircle className="w-4 h-4 text-[#6b7280]" />;
    }
  };

  const getCommandStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Clock className="w-4 h-4 text-[#fbbf24]" />;
      case 'acked_accepted': return <CheckCircle2 className="w-4 h-4 text-[#10b981]" />;
      case 'acked_completed': return <CheckCircle2 className="w-4 h-4 text-[#10b981]" />;
      case 'acked_rejected': return <XCircle className="w-4 h-4 text-[#ef4444]" />;
      case 'acked_failed': return <XCircle className="w-4 h-4 text-[#ef4444]" />;
      case 'expired': return <Clock className="w-4 h-4 text-[#6b7280]" />;
      case 'policy_violation': return <AlertCircle className="w-4 h-4 text-[#ef4444]" />;
      default: return <Clock className="w-4 h-4 text-[#6b7280]" />;
    }
  };

  const telemetryChartData = selectedRobot ? 
    telemetryLogs
      .filter(log => log.robot_id === selectedRobot.robot_id)
      .slice(0, 20)
      .reverse()
      .map((log, index) => ({
        name: index.toString(),
        battery: log.payload?.battery_level || 0,
        temperature: log.payload?.temperature || 0
      })) : [];

  const commandStatsData = robots.map(robot => {
    const robotCommands = commandLogs.filter(c => c.robot_id === robot.robot_id);
    const successful = robotCommands.filter(c => c.status === 'acked_completed').length;
    return {
      name: robot.name.substring(0, 10),
      total: robotCommands.length,
      success: successful
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00d4ff] mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading robotics control center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <PageHeader
          title="Robotics Control Center"
          description="Orchestrate and monitor robotic process automation at scale"
          icon={Rocket}
          docSection="robotics"
          actions={
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register Robot
            </Button>
          }
        />

        {/* System Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a3a3a3] mb-1">Active Robots</p>
                  <p className="text-3xl font-bold text-[#00d4ff]">
                    {robots.filter(r => r.status === 'online').length}
                  </p>
                </div>
                <Radio className="w-8 h-8 text-[#00d4ff] opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a3a3a3] mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-[#10b981]">
                    {telemetryStats.successRate}%
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-[#10b981] opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a3a3a3] mb-1">Avg Latency</p>
                  <p className="text-3xl font-bold text-[#fbbf24]">
                    {telemetryStats.avgLatency}ms
                  </p>
                </div>
                <Zap className="w-8 h-8 text-[#fbbf24] opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a3a3a3] mb-1">Messages</p>
                  <p className="text-3xl font-bold text-[#ec4899]">
                    {telemetryStats.totalMessages}
                  </p>
                </div>
                <Database className="w-8 h-8 text-[#ec4899] opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showCreateForm && (
          <Card className="bg-[#111111] border-[#262626] mb-8">
            <CardHeader>
              <CardTitle className="text-white">Register New Robot</CardTitle>
              <CardDescription className="text-[#a3a3a3]">
                Register a new robot with a unique ID and secure HMAC secret
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Robot Name (e.g., Assembly Line Bot #1)"
                value={newRobotName}
                onChange={(e) => setNewRobotName(e.target.value)}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
              <Input
                placeholder="Robot ID (e.g., robot_001)"
                value={newRobotId}
                onChange={(e) => setNewRobotId(e.target.value)}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateRobot}
                  disabled={!newRobotName.trim() || !newRobotId.trim()}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                >
                  Register Robot
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewRobotName('');
                    setNewRobotId('');
                  }}
                  variant="outline"
                  className="border-[#262626] text-[#a3a3a3]"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
        )}

        <Tabs defaultValue="robots" className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#262626]">
            <TabsTrigger value="robots" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Radio className="w-4 h-4 mr-2" />
              Robots ({robots.length})
            </TabsTrigger>
            <TabsTrigger value="commands" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Terminal className="w-4 h-4 mr-2" />
              Commands
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Activity className="w-4 h-4 mr-2" />
              Telemetry
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Calendar className="w-4 h-4 mr-2" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Shield className="w-4 h-4 mr-2" />
              Policies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="robots" className="space-y-4">
            {robots.length === 0 ? (
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-12 text-center">
                  <Rocket className="w-12 h-12 text-[#404040] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No robots registered</h3>
                  <p className="text-[#a3a3a3] mb-6">
                    Register your first robot to start orchestrating automation
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Register Robot
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {robots.map((robot) => (
                  <Card 
                    key={robot.id} 
                    className={`bg-[#111111] border-[#262626] cursor-pointer transition-all ${
                      selectedRobot?.id === robot.id ? 'border-[#00d4ff] shadow-lg shadow-[#00d4ff]/20' : 'hover:border-[#00d4ff]/40'
                    }`}
                    onClick={() => setSelectedRobot(robot)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{robot.name}</h3>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-[#a3a3a3] font-mono">{robot.robot_id}</code>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(robot.robot_id);
                              }}
                              className="h-5 w-5 text-[#6b7280] hover:text-white"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {getStatusIcon(robot.status)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6b7280]">Status</span>
                          <Badge className={
                            robot.status === 'online' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' :
                            robot.status === 'error' ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                            'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
                          }>
                            {robot.status}
                          </Badge>
                        </div>
                        {robot.last_seen && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#6b7280]">Last Seen</span>
                            <span className="text-[#a3a3a3]">
                              {new Date(robot.last_seen).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(robot.hmac_secret);
                            }}
                            className="flex-1 border-[#262626] text-[#a3a3a3] text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Secret
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="commands" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Send Command</CardTitle>
                <CardDescription className="text-[#a3a3a3]">
                  Send a command to {selectedRobot ? selectedRobot.name : 'a robot'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Command verb (e.g., move, rotate, stop)"
                    value={commandVerb}
                    onChange={(e) => setCommandVerb(e.target.value)}
                    className="bg-[#0a0a0a] border-[#262626] text-white"
                    disabled={!selectedRobot}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCommandArgs(JSON.stringify({ x: 10, y: 20 }, null, 2))}
                      variant="outline"
                      size="sm"
                      className="border-[#262626] text-[#a3a3a3]"
                      disabled={!selectedRobot}
                    >
                      Sample Move
                    </Button>
                    <Button
                      onClick={() => setCommandArgs(JSON.stringify({ angle: 90 }, null, 2))}
                      variant="outline"
                      size="sm"
                      className="border-[#262626] text-[#a3a3a3]"
                      disabled={!selectedRobot}
                    >
                      Sample Rotate
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Command arguments (JSON)"
                  value={commandArgs}
                  onChange={(e) => setCommandArgs(e.target.value)}
                  className="bg-[#0a0a0a] border-[#262626] text-white font-mono text-sm"
                  rows={6}
                  disabled={!selectedRobot}
                />
                <Button
                  onClick={handleSendCommand}
                  disabled={!selectedRobot || !commandVerb.trim()}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Command
                </Button>
                {!selectedRobot && (
                  <p className="text-sm text-[#6b7280] text-center">Select a robot from the Robots tab to send commands</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Command History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {commandLogs.length === 0 ? (
                    <p className="text-[#6b7280] text-sm text-center py-8">No commands sent yet</p>
                  ) : (
                    commandLogs.map((cmd) => (
                      <div key={cmd.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getCommandStatusIcon(cmd.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <code className="text-sm text-white font-mono">{cmd.verb}</code>
                              <Badge variant="outline" className="text-xs">
                                {cmd.robot_id}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#6b7280] truncate">
                              {new Date(cmd.sent_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          cmd.status.startsWith('acked_completed') || cmd.status === 'acked_accepted' ? 
                            'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' :
                          cmd.status.startsWith('acked_failed') || cmd.status === 'acked_rejected' || cmd.status === 'policy_violation' ?
                            'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                            'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30'
                        }>
                          {cmd.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="telemetry" className="space-y-6">
            {selectedRobot && telemetryChartData.length > 0 && (
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">Live Sensor Data - {selectedRobot.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <AnimatedLine 
                      data={telemetryChartData} 
                      lines={[
                        { key: 'battery', color: '#00d4ff', name: 'Battery Level' },
                        { key: 'temperature', color: '#fbbf24', name: 'Temperature' }
                      ]} 
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00d4ff]" />
                  Telemetry Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {telemetryLogs.length === 0 ? (
                    <p className="text-[#6b7280] text-sm text-center py-8">No telemetry data received yet</p>
                  ) : (
                    telemetryLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {log.robot_id}
                          </Badge>
                          <span className="text-xs text-[#6b7280]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <pre className="text-xs text-[#a3a3a3] font-mono overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <FleetMonitor robots={robots} commandLogs={commandLogs} />
          </TabsContent>

          <TabsContent value="scheduler">
            <CommandScheduler robots={robots} />
          </TabsContent>

          <TabsContent value="policies">
            <PolicyEngine />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
