from projects.models import Project

Project.objects.create(
    title="Alpha Dashboard",
    description="Main project dashboard",
    owner="Gregoris",
    tags=["react","frontend"],
    status="active",
    health="good",
    progress=45
)

Project.objects.create(
    title="Beta API",
    description="Backend API development",
    owner="Alex",
    tags=["django","api"],
    status="paused",
    health="warning",
    progress=30
)

Project.objects.create(
    title="Gamma Mobile",
    description="Mobile App project",
    owner="Nina",
    tags=["react-native","mobile"],
    status="completed",
    health="good",
    progress=100
)

Project.objects.create(
    title="Delta Analytics",
    description="Data analytics dashboard",
    owner="Sophia",
    tags=["python","data","analytics"],
    status="active",
    health="good",
    progress=60
)

Project.objects.create(
    title="Epsilon E-commerce",
    description="Online shopping platform",
    owner="Liam",
    tags=["django","ecommerce","backend"],
    status="active",
    health="warning",
    progress=50
)

Project.objects.create(
    title="Zeta CRM",
    description="Customer relationship management system",
    owner="Emma",
    tags=["react","frontend","crm"],
    status="paused",
    health="critical",
    progress=20
)

Project.objects.create(
    title="Eta Chatbot",
    description="AI-powered customer support chatbot",
    owner="Oliver",
    tags=["python","ai","nlp"],
    status="active",
    health="good",
    progress=70
)

Project.objects.create(
    title="Theta IoT",
    description="IoT device integration project",
    owner="Ava",
    tags=["iot","embedded"],
    status="planning",
    health="good",
    progress=10
)

Project.objects.create(
    title="Iota Security",
    description="Application security improvement",
    owner="Noah",
    tags=["security","backend"],
    status="active",
    health="warning",
    progress=40
)

Project.objects.create(
    title="Kappa Marketing",
    description="Marketing automation tool",
    owner="Mia",
    tags=["react","marketing","frontend"],
    status="active",
    health="good",
    progress=55
)

Project.objects.create(
    title="Lambda Cloud",
    description="Cloud infrastructure upgrade",
    owner="Ethan",
    tags=["cloud","devops"],
    status="paused",
    health="critical",
    progress=25
)

Project.objects.create(
    title="Mu Education",
    description="E-learning platform",
    owner="Isabella",
    tags=["django","frontend","education"],
    status="active",
    health="good",
    progress=65
)

Project.objects.create(
    title="Nu Finance",
    description="Financial reporting tool",
    owner="James",
    tags=["python","finance","backend"],
    status="active",
    health="warning",
    progress=45
)

Project.objects.create(
    title="Xi Fitness",
    description="Fitness tracking app",
    owner="Charlotte",
    tags=["react-native","mobile","fitness"],
    status="active",
    health="good",
    progress=75
)

Project.objects.create(
    title="Omicron Travel",
    description="Travel booking platform",
    owner="Benjamin",
    tags=["django","travel","backend"],
    status="completed",
    health="good",
    progress=100
)

Project.objects.create(
    title="Pi Music",
    description="Music streaming service",
    owner="Amelia",
    tags=["react","music","frontend"],
    status="active",
    health="good",
    progress=60
)

Project.objects.create(
    title="Rho Gaming",
    description="Online multiplayer game",
    owner="Lucas",
    tags=["unity","gaming","frontend"],
    status="paused",
    health="warning",
    progress=35
)

Project.objects.create(
    title="Sigma Health",
    description="Health monitoring system",
    owner="Harper",
    tags=["python","health","backend"],
    status="active",
    health="good",
    progress=50
)

Project.objects.create(
    title="Tau Logistics",
    description="Logistics management platform",
    owner="Daniel",
    tags=["django","logistics","backend"],
    status="planning",
    health="good",
    progress=15
)
