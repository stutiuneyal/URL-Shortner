```text
url-shortner/
└─ backend/
   ├─ pom.xml
   └─ src/
      ├─ main/
      │  ├─ java/com/acme/shortner/
      │  │  ├─ UrlShortnerApplication.java
      │  │  ├─ config/
      │  │  │  ├─ AppProperties.java
      │  │  │  ├─ MongoConfig.java
      │  │  │  ├─ RedisConfig.java
      │  │  │  └─ SecurityConfig.java
      │  │  ├─ security/
      │  │  │  ├─ JwtService.java
      │  │  │  └─ JwtAuthFilter.java
      │  │  ├─ rate/
      │  │  │  └─ RateLimiterFilter.java
      │  │  ├─ model/
      │  │  │  ├─ User.java
      │  │  │  ├─ Workspace.java
      │  │  │  ├─ Domain.java
      │  │  │  └─ Link.java
      │  │  ├─ repo/
      │  │  │  ├─ UserRepository.java
      │  │  │  ├─ WorkspaceRepository.java
      │  │  │  ├─ DomainRepository.java
      │  │  │  └─ LinkRepository.java
      │  │  ├─ dto/
      │  │  │  ├─ AuthDtos.java
      │  │  │  ├─ LinkDtos.java
      │  │  │  └─ CommonDtos.java
      │  │  ├─ service/
      │  │  │  ├─ AuthService.java
      │  │  │  ├─ WorkspaceService.java
      │  │  │  ├─ DomainService.java
      │  │  │  ├─ LinkService.java
      │  │  │  └─ AnalyticsService.java
      │  │  ├─ web/
      │  │  │  ├─ AuthController.java
      │  │  │  ├─ WorkspaceController.java
      │  │  │  ├─ DomainController.java
      │  │  │  ├─ LinkController.java
      │  │  │  ├─ AnalyticsController.java
      │  │  │  └─ RedirectController.java
      │  │  ├─ util/
      │  │  │  ├─ SlugUtil.java
      │  │  │  └─ CryptoUtil.java
      │  │  └─ advice/
      │  │     └─ GlobalExceptionHandler.java
      │  └─ resources/
      │     ├─ application.yml
      │     └─ application-dev.yml
      └─ test/java/… (we’ll fill later)
```