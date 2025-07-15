// Default Node-RED flow
export const defaultNodeRedFlow = `[
  {"id":"609e5eb634beaf5c","type":"tab","label":"Flow 1","disabled":false,"info":"","env":[]},
  {"id":"a0ce2ea0.b7597","type":"inject","z":"609e5eb634beaf5c","name":"Simulate Data","props":[{"p":"payload"}],"repeat":"0.5","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"{\\"equipment\\":\\"Drill Press\\",\\"timestamp\\":\\"2023-09-22T12:34:56Z\\",\\"efficiency\\":89.5}","payloadType":"json","x":140,"y":80,"wires":[["8d32bd8d.6d5cc"]]},
  {"id":"8d32bd8d.6d5cc","type":"json","z":"609e5eb634beaf5c","name":"Parse JSON","property":"payload","action":"obj","pretty":false,"x":330,"y":80,"wires":[["673dc89e.64ac18"]]},
  {"id":"673dc89e.64ac18","type":"join","z":"609e5eb634beaf5c","name":"Group Messages","mode":"custom","build":"array","property":"payload","propertyType":"msg","key":"topic","joiner":"\
","joinerType":"str","accumulate":false,"timeout":"","count":"10","reduceRight":false,"reduceExp":"","reduceInit":"","reduceInitType":"","reduceFixup":"","x":530,"y":80,"wires":[["1780e12a.aa407f"]]},
  {"id":"1780e12a.aa407f","type":"function","z":"609e5eb634beaf5c","name":"Calculate Efficiency","func":"let arr = msg.payload;\
let sum = 0;\
let count = 0;\
\
arr.forEach(function(item) {\
    sum += item.efficiency;\
    count++;\
});\
\
let averageEfficiency = sum / count;\
\
msg.payload = {\
    equipment: arr[0].equipment,\
    averageEfficiency: averageEfficiency\
};\
\
return msg;","outputs":1,"timeout":"","noerr":0,"initialize":"","finalize":"","libs":[],"x":750,"y":80,"wires":[["6285ddd29f8b38c7"]]},
  {"id":"6a79ba9.44db444","type":"debug","z":"609e5eb634beaf5c","name":"Output","active":false,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","x":1110,"y":80,"wires":[]},
  {"id":"6285ddd29f8b38c7","type":"json","z":"609e5eb634beaf5c","name":"Parse Object","property":"payload","action":"str","pretty":false,"x":950,"y":80,"wires":[["6a79ba9.44db444"]]},
  {"id":"subflow1","type":"subflow","name":"My Subflow","info":"","in":[{"x":50,"y":30,"wires":[{"id":"subnode1"}]}],"out":[{"x":350,"y":30,"wires":[{"id":"subnode2","port":0}]}]},
  {"id":"subnode1","type":"function","z":"subflow1","name":"Subflow Function 1","func":"// Your function code here\
return msg;","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":230,"y":30,"wires":[["subnode2"]]},
  {"id":"subnode2","type":"function","z":"subflow1","name":"Subflow Function 2","func":"// Your function code here\
return msg;","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":430,"y":30,"wires":[[]]},
  {"id":"config1","type":"mqtt-broker","name":"MQTT Config","broker":"localhost","port":"1883","clientid":"","usetls":false,"compatmode":false,"protocolVersion":"4","keepalive":"60","cleansession":true,"birthTopic":"","birthQos":"0","birthPayload":"","birthMsg":{},"closeTopic":"","closeQos":"0","closePayload":"","closeMsg":{},"willTopic":"","willQos":"0","willPayload":"","willMsg":{},"sessionExpiry":""}
]`;

// Final Node-RED flow with all node categories and Redis nodes included
export const advancedNodeRedFlow = [
  // Tab: Flow 1
  {
    id: 'tab_flow1',
    type: 'tab',
    label: 'Flow 1',
    disabled: false,
    info: '',
    env: [],
  },

  // --------------------------------
  // Input Nodes
  // --------------------------------

  // Inject Node (Time-Based)
  {
    id: 'inject_time',
    type: 'inject',
    z: 'tab_flow1',
    name: 'Inject Timer',
    props: [{ p: 'payload' }],
    repeat: '60',
    crontab: '',
    once: false,
    onceDelay: 0.1,
    topic: '',
    payload: '{"timestamp":"{{timestamp}}"}',
    payloadType: 'json',
    x: 100,
    y: 80,
    wires: [['json_parse_time']],
  },

  // HTTP In Node (Communication)
  {
    id: 'http_in',
    type: 'http in',
    z: 'tab_flow1',
    name: 'HTTP In',
    url: '/api/data',
    method: 'post',
    upload: false,
    swaggerDoc: '',
    x: 100,
    y: 160,
    wires: [['json_parse_http']],
  },

  // WebSocket In Node (Communication)
  {
    id: 'websocket_in',
    type: 'websocket in',
    z: 'tab_flow1',
    name: 'WebSocket In',
    server: '',
    client: '',
    x: 100,
    y: 240,
    wires: [['json_parse_ws']],
  },

  // File In Node (Data Processing)
  {
    id: 'file_in',
    type: 'file in',
    z: 'tab_flow1',
    name: 'File In',
    filename: '/path/to/input.csv',
    format: 'utf8',
    chunk: false,
    sendError: false,
    encoding: 'none',
    x: 100,
    y: 320,
    wires: [['csv_parse']],
  },

  // MQTT In Node (IoT and Hardware)
  {
    id: 'mqtt_in',
    type: 'mqtt in',
    z: 'tab_flow1',
    name: 'MQTT In',
    topic: 'sensor/data',
    qos: '2',
    datatype: 'auto',
    broker: 'mqtt_broker',
    x: 100,
    y: 400,
    wires: [['json_parse_mqtt']],
  },

  // Redis In Node (Storage)
  {
    id: 'redis_in',
    type: 'redis in',
    z: 'tab_flow1',
    name: 'Redis In',
    host: 'localhost',
    port: '6379',
    db: '0',
    command: 'GET',
    key: 'sensor:latest',
    x: 100,
    y: 480,
    wires: [['json_parse_redis']],
  },

  // --------------------------------
  // Output Nodes
  // --------------------------------

  // HTTP Response Node (Communication)
  {
    id: 'http_response',
    type: 'http response',
    z: 'tab_flow1',
    name: 'HTTP Response',
    statusCode: '',
    headers: {},
    x: 700,
    y: 160,
    wires: [],
  },

  // WebSocket Out Node (Communication)
  {
    id: 'websocket_out',
    type: 'websocket out',
    z: 'tab_flow1',
    name: 'WebSocket Out',
    server: '',
    client: '',
    x: 700,
    y: 240,
    wires: [],
  },

  // File Out Node (Data Processing)
  {
    id: 'file_out',
    type: 'file',
    z: 'tab_flow1',
    name: 'File Out',
    filename: '/path/to/output.csv',
    appendNewline: true,
    createDir: false,
    overwriteFile: 'true',
    encoding: 'none',
    x: 700,
    y: 320,
    wires: [],
  },

  // MQTT Out Node (IoT and Hardware)
  {
    id: 'mqtt_out',
    type: 'mqtt out',
    z: 'tab_flow1',
    name: 'MQTT Out',
    topic: 'sensor/processed',
    qos: '',
    retain: '',
    broker: 'mqtt_broker',
    x: 700,
    y: 400,
    wires: [],
  },

  // Redis Out Node (Storage)
  {
    id: 'redis_out',
    type: 'redis out',
    z: 'tab_flow1',
    name: 'Redis Out',
    host: 'localhost',
    port: '6379',
    db: '0',
    command: 'SET',
    x: 700,
    y: 480,
    wires: [],
  },

  // --------------------------------
  // Functionality Nodes
  // --------------------------------

  // JSON Parse Nodes
  {
    id: 'json_parse_time',
    type: 'json',
    z: 'tab_flow1',
    name: 'Parse Time JSON',
    property: 'payload',
    action: 'obj',
    pretty: false,
    x: 300,
    y: 80,
    wires: [['join_time']],
  },
  {
    id: 'json_parse_http',
    type: 'json',
    z: 'tab_flow1',
    name: 'Parse HTTP JSON',
    property: 'payload',
    action: 'obj',
    pretty: false,
    x: 300,
    y: 160,
    wires: [['process_http']],
  },
  {
    id: 'json_parse_ws',
    type: 'json',
    z: 'tab_flow1',
    name: 'Parse WS JSON',
    property: 'payload',
    action: 'obj',
    pretty: false,
    x: 300,
    y: 240,
    wires: [['process_ws']],
  },
  {
    id: 'json_parse_mqtt',
    type: 'json',
    z: 'tab_flow1',
    name: 'Parse MQTT JSON',
    property: 'payload',
    action: 'obj',
    pretty: false,
    x: 300,
    y: 400,
    wires: [['process_mqtt']],
  },
  {
    id: 'json_parse_redis',
    type: 'json',
    z: 'tab_flow1',
    name: 'Parse Redis JSON',
    property: 'payload',
    action: 'obj',
    pretty: false,
    x: 300,
    y: 480,
    wires: [['process_redis']],
  },

  // CSV Parse Node
  {
    id: 'csv_parse',
    type: 'csv',
    z: 'tab_flow1',
    name: 'Parse CSV',
    sep: ',',
    hdrin: true,
    hdrout: '',
    multi: 'one',
    ret: '\
',
    temp: '',
    skip: '0',
    strings: '',
    include_empty_strings: false,
    include_null_values: false,
    x: 300,
    y: 320,
    wires: [['process_csv']],
  },

  // Join Node (Advanced Functionality)
  {
    id: 'join_time',
    type: 'join',
    z: 'tab_flow1',
    name: 'Join Time Messages',
    mode: 'custom',
    build: 'array',
    property: 'payload',
    propertyType: 'msg',
    key: 'topic',
    joiner: '\
',
    joinerType: 'str',
    accumulate: false,
    timeout: '',
    count: '5',
    reduceRight: false,
    reduceExp: '',
    reduceInit: '',
    reduceInitType: '',
    reduceFixup: '',
    x: 500,
    y: 80,
    wires: [['function_process_time']],
  },

  // Function Nodes (Functionality)
  {
    id: 'function_process_time',
    type: 'function',
    z: 'tab_flow1',
    name: 'Process Time Data',
    func: `// Example processing of time data
msg.payload.processedTime = new Date().toISOString();
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 700,
    y: 80,
    wires: [['redis_out']],
  },

  {
    id: 'process_http',
    type: 'function',
    z: 'tab_flow1',
    name: 'Process HTTP Data',
    func: `// Example processing of HTTP data
msg.payload.status = 'HTTP Received';
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 500,
    y: 160,
    wires: [['http_response', 'redis_out']],
  },

  {
    id: 'process_ws',
    type: 'function',
    z: 'tab_flow1',
    name: 'Process WS Data',
    func: `// Example processing of WebSocket data
msg.payload.status = 'WebSocket Received';
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 500,
    y: 240,
    wires: [['websocket_out', 'redis_out']],
  },

  {
    id: 'process_csv',
    type: 'function',
    z: 'tab_flow1',
    name: 'Process CSV Data',
    func: `// Example processing of CSV data
msg.payload.status = 'CSV Processed';
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 500,
    y: 320,
    wires: [['file_out', 'redis_out']],
  },

  {
    id: 'process_mqtt',
    type: 'function',
    z: 'tab_flow1',
    name: 'Process MQTT Data',
    func: `// Example processing of MQTT data
msg.payload.status = 'MQTT Processed';
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 500,
    y: 400,
    wires: [['mqtt_out', 'redis_out']],
  },

  {
    id: 'process_redis',
    type: 'function',
    z: 'tab_flow1',
    name: 'Process Redis Data',
    func: `// Example processing of Redis data
msg.payload.status = 'Redis Data Processed';
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 500,
    y: 480,
    wires: [['debug_redis']],
  },

  // Change Node (Functionality)
  {
    id: 'change_status',
    type: 'change',
    z: 'tab_flow1',
    name: 'Change Status',
    rules: [
      {
        t: 'set',
        p: 'payload.status',
        pt: 'msg',
        to: '"Updated Status"',
        tot: 'json',
      },
    ],
    action: '',
    property: '',
    from: '',
    to: '',
    reg: false,
    x: 500,
    y: 560,
    wires: [['template_status']],
  },

  // Template Node (Functionality)
  {
    id: 'template_status',
    type: 'template',
    z: 'tab_flow1',
    name: 'Template Status Message',
    field: 'payload',
    fieldType: 'msg',
    format: 'handlebars',
    syntax: 'mustache',
    template: 'Status has been {{payload.status}}',
    output: 'str',
    x: 700,
    y: 560,
    wires: [['debug_template']],
  },

  // --------------------------------
  // Social Nodes
  // --------------------------------

  // Slack Out Node (Social)
  {
    id: 'slack_out',
    type: 'slack out',
    z: 'tab_flow1',
    name: 'Slack Notification',
    channel: '#general',
    sendAs: 'node-red',
    token: 'YOUR_SLACK_TOKEN',
    x: 1000,
    y: 240,
    wires: [],
  },

  // Facebook Out Node (Social)
  {
    id: 'facebook_out',
    type: 'facebook out',
    z: 'tab_flow1',
    name: 'Facebook Post',
    facebook: 'facebook_config',
    x: 1000,
    y: 320,
    wires: [],
  },

  // Telegram Out Node (Social)
  {
    id: 'telegram_out',
    type: 'telegram out',
    z: 'tab_flow1',
    name: 'Telegram Message',
    bot: 'telegram_bot',
    chatId: 'CHAT_ID',
    x: 1000,
    y: 400,
    wires: [],
  },

  // --------------------------------
  // Notification Nodes
  // --------------------------------

  // Email Node (Notification)
  {
    id: 'email_out',
    type: 'e-mail',
    z: 'tab_flow1',
    name: 'Send Email',
    server: 'smtp.gmail.com',
    port: '465',
    secure: true,
    tls: true,
    dname: 'Email Notification',
    from: 'your-email@gmail.com',
    to: 'recipient@example.com',
    subject: 'Node-RED Alert',
    body: 'This is a test email from Node-RED.',
    attachments: '',
    x: 1000,
    y: 480,
    wires: [],
  },

  // Pushbullet Out Node (Notification)
  {
    id: 'pushbullet_out',
    type: 'pushbullet out',
    z: 'tab_flow1',
    name: 'Pushbullet Notification',
    apiKey: 'YOUR_PUSHBULLET_API_KEY',
    device: 'all',
    title: 'Node-RED Alert',
    body: 'A new event has occurred.',
    x: 1000,
    y: 560,
    wires: [],
  },

  // --------------------------------
  // Machine Learning/AI Nodes
  // --------------------------------

  // TensorFlow.js Node (Machine Learning/AI)
  {
    id: 'tfjs_node',
    type: 'tfjs',
    z: 'tab_flow1',
    name: 'TensorFlow.js Model',
    modelPath: '/path/to/model.json',
    x: 1200,
    y: 80,
    wires: [['ml_output']],
  },

  // Watson AI Node (Machine Learning/AI)
  {
    id: 'watson_ai',
    type: 'watson-language-translator',
    z: 'tab_flow1',
    name: 'Watson Translator',
    service: 'watson_service',
    x: 1200,
    y: 160,
    wires: [['watson_output']],
  },

  // --------------------------------
  // Time-Based Nodes
  // --------------------------------

  // Cron Plus Node (Time-Based)
  {
    id: 'cron_plus',
    type: 'cron-plus',
    z: 'tab_flow1',
    name: 'Daily Cron Task',
    outputField: 'payload',
    timeZone: '',
    persistDynamic: false,
    commandResponseMsgOutput: 'output1',
    outputs: 1,
    options: [
      {
        name: 'Daily Midnight',
        topic: '',
        payloadType: 'date',
        payload: '',
        expressionType: 'cron',
        expression: '0 0 0 * * *',
        location: '',
        timezone: '',
        x: 300,
        y: 560,
        wires: [['cron_function']],
      },
    ],
    x: 300,
    y: 560,
    wires: [['cron_function']],
  },

  // Function Node for Cron (Time-Based)
  {
    id: 'cron_function',
    type: 'function',
    z: 'tab_flow1',
    name: 'Cron Task Function',
    func: `msg.payload = "Daily Cron Task Executed";
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 500,
    y: 560,
    wires: [['slack_out', 'email_out']],
  },

  // --------------------------------
  // Advanced Functionality Nodes
  // --------------------------------

  // Subflow: Logger Subflow
  {
    id: 'subflow_logger',
    type: 'subflow',
    name: 'Logger Subflow',
    info: '',
    in: [{ x: 50, y: 640, wires: [{ id: 'subnode_log_in' }] }],
    out: [{ x: 350, y: 640, wires: [{ id: 'subnode_log_out', port: 0 }] }],
  },

  // Subflow Nodes
  {
    id: 'subnode_log_in',
    type: 'function',
    z: 'subflow_logger',
    name: 'Format Log',
    func: `msg.payload = \`Log Entry: \${ msg.payload }\`;
return msg;`,
    outputs: 1,
    noerr: 0,
    x: 150,
    y: 640,
    wires: [['subnode_log_out']],
  },
  {
    id: 'subnode_log_out',
    type: 'debug',
    z: 'subflow_logger',
    name: 'Log Output',
    active: true,
    tosidebar: true,
    console: false,
    tostatus: false,
    complete: 'payload',
    targetType: 'msg',
    x: 350,
    y: 640,
    wires: [],
  },

  // Link In Node (Advanced Functionality)
  {
    id: 'link_in',
    type: 'link in',
    z: 'tab_flow1',
    name: 'Link In',
    links: ['link_out'],
    x: 1000,
    y: 80,
    wires: [['subflow_logger']],
  },

  // Link Out Node (Advanced Functionality)
  {
    id: 'link_out',
    type: 'link out',
    z: 'tab_flow1',
    name: 'Link Out',
    links: ['link_in'],
    x: 1000,
    y: 160,
    wires: [],
  },

  // --------------------------------
  // Storage Nodes
  // --------------------------------

  // MongoDB Out Node (Storage)
  {
    id: 'mongodb_out',
    type: 'mongodb out',
    z: 'tab_flow1',
    name: 'Store in MongoDB',
    collection: 'sensorData',
    payonly: true,
    upsert: false,
    multi: false,
    x: 1200,
    y: 240,
    wires: [],
  },

  // SQLite Out Node (Storage)
  {
    id: 'sqlite_out',
    type: 'sqlite',
    z: 'tab_flow1',
    name: 'SQLite Store',
    db: 'sqlite_db',
    sqlquery: 'INSERT INTO sensor_data (data) VALUES (:payload)',
    x: 1200,
    y: 320,
    wires: [[]],
  },

  // MySQL Out Node (Storage)
  {
    id: 'mysql_out',
    type: 'mysql',
    z: 'tab_flow1',
    name: 'MySQL Store',
    mydb: 'mysql_config',
    x: 1200,
    y: 400,
    wires: [[]],
  },

  // PostgreSQL Out Node (Storage)
  {
    id: 'postgresql_out',
    type: 'postgresql',
    z: 'tab_flow1',
    name: 'PostgreSQL Store',
    postgresql: 'postgres_config',
    x: 1200,
    y: 480,
    wires: [[]],
  },

  // --------------------------------
  // Machine Learning/AI Output Nodes
  // --------------------------------

  // Debug Node for TensorFlow.js Output
  {
    id: 'ml_output',
    type: 'debug',
    z: 'tab_flow1',
    name: 'ML Output Debug',
    active: true,
    tosidebar: true,
    console: false,
    tostatus: false,
    complete: 'payload',
    targetType: 'msg',
    x: 1400,
    y: 80,
    wires: [],
  },

  // Debug Node for Watson AI Output
  {
    id: 'watson_output',
    type: 'debug',
    z: 'tab_flow1',
    name: 'Watson Output Debug',
    active: true,
    tosidebar: true,
    console: false,
    tostatus: false,
    complete: 'payload',
    targetType: 'msg',
    x: 1400,
    y: 160,
    wires: [],
  },

  // --------------------------------
  // Dashboard (UI) Nodes
  // --------------------------------

  // UI Button Node
  {
    id: 'ui_button1',
    type: 'ui_button',
    z: 'tab_flow1',
    name: 'Dashboard Button',
    group: 'ui_group1',
    order: 1,
    width: 0,
    height: 0,
    passthru: false,
    label: 'Click Me',
    tooltip: '',
    color: '',
    bgcolor: '',
    icon: '',
    payload: 'Button Clicked',
    payloadType: 'str',
    topic: '',
    x: 300,
    y: 560,
    wires: [['debug_dashboard']],
  },

  // UI Chart Node
  {
    id: 'ui_chart1',
    type: 'ui_chart',
    z: 'tab_flow1',
    name: 'Dashboard Chart',
    group: 'ui_group1',
    order: 2,
    width: 0,
    height: 0,
    label: 'Sensor Data',
    chartType: 'line',
    legend: 'false',
    x: 300,
    y: 640,
    wires: [[]],
  },

  // UI Slider Node
  {
    id: 'ui_slider1',
    type: 'ui_slider',
    z: 'tab_flow1',
    name: 'Dashboard Slider',
    group: 'ui_group1',
    order: 3,
    width: 0,
    height: 0,
    label: 'Adjust Value',
    tooltip: '',
    handle: 'square',
    min: 0,
    max: 100,
    step: 1,
    x: 300,
    y: 720,
    wires: [['change_status']],
  },

  // UI Text Node
  {
    id: 'ui_text1',
    type: 'ui_text',
    z: 'tab_flow1',
    name: 'Dashboard Text',
    group: 'ui_group1',
    order: 4,
    width: 0,
    height: 0,
    label: 'Status',
    format: '{{msg.payload}}',
    layout: 'row-left',
    x: 300,
    y: 800,
    wires: [],
  },

  // UI Switch Node
  {
    id: 'ui_switch1',
    type: 'ui_switch',
    z: 'tab_flow1',
    name: 'Dashboard Switch',
    group: 'ui_group1',
    order: 5,
    width: 0,
    height: 0,
    label: 'Toggle',
    tooltip: '',
    topic: '',
    style: '',
    onvalue: 'true',
    onvalueType: 'bool',
    offvalue: 'false',
    offvalueType: 'bool',
    x: 300,
    y: 880,
    wires: [['change_status']],
  },

  // UI Group
  {
    id: 'ui_group1',
    type: 'ui_group',
    name: 'Default Group',
    tab: 'ui_tab1',
    order: 1,
    disp: true,
    width: '6',
    collapse: false,
  },

  // UI Tab
  { id: 'ui_tab1', type: 'ui_tab', name: 'Home', icon: 'dashboard', order: 1 },

  // Debug Dashboard Node
  {
    id: 'debug_dashboard',
    type: 'debug',
    z: 'tab_flow1',
    name: 'Debug Dashboard',
    active: true,
    tosidebar: true,
    console: false,
    tostatus: false,
    complete: 'payload',
    targetType: 'msg',
    x: 500,
    y: 560,
    wires: [],
  },

  // --------------------------------
  // Storage Configurations
  // --------------------------------

  // Redis Configuration
  {
    id: 'redis_config',
    type: 'redis-config',
    z: '',
    hostname: 'localhost',
    port: '6379',
    db: '0',
    password: '',
    return_buffers: false,
    name: 'Local Redis',
  },

  // MQTT Broker Configuration
  {
    id: 'mqtt_broker',
    type: 'mqtt-broker',
    z: '',
    name: 'Local MQTT Broker',
    broker: 'localhost',
    port: '1883',
    clientid: '',
    usetls: false,
    compatmode: false,
    protocolVersion: '4',
    keepalive: '60',
    cleansession: true,
    birthTopic: '',
    birthQos: '0',
    birthPayload: '',
    birthMsg: {},
    closeTopic: '',
    closeQos: '0',
    closePayload: '',
    closeMsg: {},
    willTopic: '',
    willQos: '0',
    willPayload: '',
    willMsg: {},
    sessionExpiry: '',
  },

  // MongoDB Configuration
  {
    id: 'mongodb_config',
    type: 'mongodb',
    z: '',
    hostname: 'localhost',
    port: '27017',
    db: 'node_red',
    name: 'Local MongoDB',
    usetls: false,
    tls: '',
  },

  // MySQL Configuration
  {
    id: 'mysql_config',
    type: 'mysql-config',
    z: '',
    name: 'Local MySQL',
    host: 'localhost',
    port: '3306',
    db: 'node_red',
    tz: '',
    charset: '',
    ssl: false,
    username: 'root',
    password: 'password',
  },

  // PostgreSQL Configuration
  {
    id: 'postgres_config',
    type: 'postgresql',
    z: '',
    hostname: 'localhost',
    port: '5432',
    database: 'node_red',
    name: 'Local PostgreSQL',
    username: 'postgres',
    password: 'password',
    sslmode: 'disable',
  },
];
