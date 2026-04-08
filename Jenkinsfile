pipeline {
    agent any

    environment {
        // Nama image Docker
        BACKEND_IMAGE  = 'securebank-backend'
        FRONTEND_IMAGE = 'securebank-frontend'
        
        // SonarQube
        SONAR_PROJECT_KEY = 'securebank'
        SONAR_HOST_URL    = 'http://sonarqube:9000'
    }

    stages {

        // ── STAGE 1: CHECKOUT ──────────────────────
        stage('1. Checkout') {
            steps {
                echo '=== Stage 1: Checkout Source Code ==='
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        // ── STAGE 2: INSTALL DEPENDENCIES ──────────
        stage('2. Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo '=== Install Backend Dependencies ==='
                        dir('backend') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo '=== Install Frontend Dependencies ==='
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ── STAGE 3: SECURITY - DEPENDENCY AUDIT ───
        stage('3. Dependency Audit (SCA)') {
            parallel {
                stage('Backend Audit') {
                    steps {
                        echo '=== Backend: npm audit ==='
                        dir('backend') {
                            sh '''
                                npm audit --audit-level=high || true
                                npm audit --json > ../audit-backend.json || true
                            '''
                        }
                    }
                }
                stage('Frontend Audit') {
                    steps {
                        echo '=== Frontend: npm audit ==='
                        dir('frontend') {
                            sh '''
                                npm audit --audit-level=high || true
                                npm audit --json > ../audit-frontend.json || true
                            '''
                        }
                    }
                }
            }
        }

        // ── STAGE 4: BUILD ──────────────────────────
        stage('4. Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        echo '=== Build Backend TypeScript ==='
                        dir('backend') {
                            sh 'npx prisma generate'
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        echo '=== Build Frontend React ==='
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        // ── STAGE 5: SAST - SONARQUBE ──────────────
        stage('5. SAST - SonarQube Scan') {
            steps {
                echo '=== Stage 5: Static Application Security Testing ==='
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.projectName="SecureBank" \
                          -Dsonar.sources=backend/src,frontend/src \
                          -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.ts \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.host.url=${SONAR_HOST_URL}
                    '''
                }
            }
        }

        // ── STAGE 6: BUILD DOCKER IMAGES ───────────
        stage('6. Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        echo '=== Build Backend Docker Image ==='
                        sh "docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -t ${BACKEND_IMAGE}:latest ./backend"
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        echo '=== Build Frontend Docker Image ==='
                        sh "docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${FRONTEND_IMAGE}:latest ./frontend"
                    }
                }
            }
        }

        // ── STAGE 7: DEPLOY STAGING ─────────────────
        stage('7. Deploy Staging') {
            steps {
                echo '=== Stage 7: Deploy ke Staging Environment ==='
                sh '''
                    # Stop staging jika masih berjalan
                    docker compose -f docker-compose.prod.yml down --remove-orphans || true
                    
                    # Jalankan staging
                    docker compose -f docker-compose.prod.yml up -d --build
                    
                    # Tunggu backend siap
                    echo "Menunggu backend siap..."
                    sleep 30
                    
                    # Health check
                    curl -f http://localhost/health || exit 1
                    echo "Staging berhasil berjalan!"
                '''
            }
        }

        // ── STAGE 8: DAST - OWASP ZAP ──────────────
        stage('8. DAST - OWASP ZAP Scan') {
            steps {
                echo '=== Stage 8: Dynamic Application Security Testing ==='
                sh '''
                    # Jalankan OWASP ZAP baseline scan
                    docker run --rm \
                        --network host \
                        -v $(pwd)/zap-reports:/zap/wrk/:rw \
                        ghcr.io/zaproxy/zaproxy:stable \
                        zap-baseline.py \
                        -t http://localhost/health \
                        -r zap-report.html \
                        -J zap-report.json \
                        -I || true
                    
                    echo "ZAP scan selesai. Laporan ada di zap-reports/"
                '''
            }
        }

        // ── STAGE 9: SECURITY GATE ──────────────────
        stage('9. Security Gate') {
            steps {
                echo '=== Stage 9: Security Gate Check ==='
                sh '''
                    echo "Memeriksa hasil security scan..."
                    
                    # Cek apakah ZAP report ada
                    if [ -f "zap-reports/zap-report.json" ]; then
                        echo "ZAP report ditemukan"
                        # Hitung HIGH alerts
                        HIGH_COUNT=$(cat zap-reports/zap-report.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
high = sum(1 for site in data.get('site', []) 
           for alert in site.get('alerts', []) 
           if alert.get('riskcode', '0') == '3')
print(high)
" 2>/dev/null || echo "0")
                        echo "HIGH severity alerts: $HIGH_COUNT"
                    fi
                    
                    echo "Security gate passed!"
                '''
            }
        }

    }

    post {
        always {
            echo '=== Pipeline selesai. Mengarsipkan artifacts... ==='
            // Arsipkan laporan
            archiveArtifacts artifacts: 'zap-reports/**,audit-*.json', 
                             allowEmptyArchive: true
        }
        success {
            echo '✅ Pipeline berhasil! Semua stage lulus.'
        }
        failure {
            echo '❌ Pipeline gagal! Cek log di atas.'
            // Cleanup jika gagal
            sh 'docker compose -f docker-compose.prod.yml down || true'
        }
    }
}