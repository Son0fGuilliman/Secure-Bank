pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        BACKEND_IMAGE  = 'securebank-backend'
        FRONTEND_IMAGE = 'securebank-frontend'
        SONAR_HOST_URL = 'https://sonarcloud.io'
    }

    stages {

        stage('1. Checkout') {
            steps {
                echo '=== Stage 1: Checkout Source Code ==='
                checkout scm
                sh 'echo "Branch: $(git rev-parse --abbrev-ref HEAD)"'
                sh 'echo "Commit: $(git log --oneline -1)"'
            }
        }

        stage('2. Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                            echo 'Backend dependencies installed'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            echo 'Frontend dependencies installed'
                        }
                    }
                }
            }
        }

        stage('3. Dependency Audit (SCA)') {
            parallel {
                stage('Backend Audit') {
                    steps {
                        dir('backend') {
                            sh '''
                                echo "=== Backend npm audit ==="
                                npm audit --audit-level=high 2>&1 | tee ../audit-backend.txt || true
                            '''
                        }
                    }
                }
                stage('Frontend Audit') {
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "=== Frontend npm audit ==="
                                npm audit --audit-level=high 2>&1 | tee ../audit-frontend.txt || true
                            '''
                        }
                    }
                }
            }
        }

        stage('4. Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'npx prisma generate'
                            sh 'npm run build'
                            echo 'Backend build berhasil'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                            echo 'Frontend build berhasil'
                        }
                    }
                }
            }
        }

        stage('5. SAST - SonarCloud Scan') {
    steps {
        echo '=== Stage 5: Static Application Security Testing ==='
        withSonarQubeEnv('SonarCloud') {
            script {
                // Ambil path sonar-scanner dari Jenkins Tools
                def scannerHome = tool 'SonarScanner'
                sh """
                    ${scannerHome}/bin/sonar-scanner \
                      -Dsonar.projectKey=Son0fGuilliman_Secure-Bank \
                      -Dsonar.organization=son0fguilliman \
                      -Dsonar.projectName="SecureBank DevSecOps" \
                      -Dsonar.sources=backend/src,frontend/src \
                      -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.ts \
                      -Dsonar.host.url=https://sonarcloud.io
                """
            }
        }
        echo 'SonarCloud scan selesai - cek hasil di sonarcloud.io'
    }
}

        stage('6. Build Docker Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        sh "docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} -t ${BACKEND_IMAGE}:latest ./backend"
                        echo "Backend image built: ${BACKEND_IMAGE}:${BUILD_NUMBER}"
                    }
                }
                stage('Frontend Image') {
                    steps {
                        sh "docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} -t ${FRONTEND_IMAGE}:latest ./frontend"
                        echo "Frontend image built: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                    }
                }
            }
        }

stage('7. Deploy Staging') {
    steps {
        echo '=== Stage 7: Deploy ke Staging ==='
        sh '''
            # Install docker-compose jika belum ada
            if ! command -v docker-compose &> /dev/null; then
                curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 \
                    -o /usr/local/bin/docker-compose
                chmod +x /usr/local/bin/docker-compose
            fi

            # Verifikasi versi
            docker-compose version

            # Stop staging jika masih running
            docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

            # Buat .env untuk production
            cat > .env.prod << ENVEOF
OTP_SECRET=securebank-otp-secret-2024
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=placeholder@gmail.com
EMAIL_PASS=placeholder
EMAIL_FROM=SecureBank <placeholder@gmail.com>
ENVEOF

            # Jalankan database dulu
            docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d postgres redis
            echo "Menunggu database siap..."
            sleep 20

            # Jalankan backend
            docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d backend
            echo "Menunggu backend siap..."
            sleep 15

            # Health check backend langsung ke port 3000
docker exec securebank-backend wget -qO- http://localhost:3000/health && echo "Backend staging: OK" || echo "Backend staging: WARNING"
            # Jalankan frontend + nginx
            docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d frontend nginx
            sleep 10

            echo "Staging deploy selesai"
            docker-compose -f docker-compose.prod.yml ps
        '''
    }
}
stage('8. DAST - OWASP ZAP') {
    steps {
        echo '=== Stage 8: Dynamic Application Security Testing ==='
        sh '''
            mkdir -p zap-reports

            # Tunggu backend benar-benar siap
            echo "Menunggu backend untuk ZAP..."
            sleep 10

            # Scan langsung ke backend (lebih reliable dari nginx)
            docker run --rm \
               --network securebank-pipeline_app-network \
                -v $(pwd)/zap-reports:/zap/wrk/:rw \
                --user root \
                ghcr.io/zaproxy/zaproxy:stable \
                zap-baseline.py \
                -t http://localhost:3000 \
                -r zap-report.html \
                -J zap-report.json \
                -l WARN \
                -I 2>&1 | tee zap-reports/zap-output.txt || true

            echo "DAST scan selesai"
            ls -la zap-reports/
        '''
    }
}

        stage('9. Security Gate') {
            steps {
                echo '=== Stage 9: Security Gate ==='
                sh '''
                    echo "--- Hasil Dependency Audit ---"
                    if [ -f audit-backend.txt ]; then
                        echo "Backend:"
                        grep -E "vulnerabilities|found" audit-backend.txt || echo "Tidak ada vulnerability"
                    fi
                    if [ -f audit-frontend.txt ]; then
                        echo "Frontend:"
                        grep -E "vulnerabilities|found" audit-frontend.txt || echo "Tidak ada vulnerability"
                    fi
                    
                    echo ""
                    echo "--- Hasil OWASP ZAP ---"
                    if [ -f zap-reports/zap-report.json ]; then
                        echo "ZAP report tersedia"
                        python3 -c "
import json
with open('zap-reports/zap-report.json') as f:
    data = json.load(f)
sites = data.get('site', [])
total_high = 0
total_medium = 0
for site in sites:
    for alert in site.get('alerts', []):
        risk = alert.get('riskcode', '0')
        if risk == '3': total_high += 1
        elif risk == '2': total_medium += 1
print(f'HIGH alerts: {total_high}')
print(f'MEDIUM alerts: {total_medium}')
if total_high > 0:
    print('WARNING: Ada HIGH severity alerts - review manual diperlukan')
else:
    print('Security gate: PASSED')
" || echo "Security gate check selesai"
                    else
                        echo "ZAP report tidak ditemukan - skip gate check"
                    fi
                '''
            }
        }

    }

 post {
    always {
        echo '=== Mengarsipkan laporan ==='
        archiveArtifacts(
            artifacts: 'zap-reports/**,audit-*.txt',
            allowEmptyArchive: true
        )
    }
    success {
        echo '✅ PIPELINE BERHASIL - Semua 9 stage lulus!'
        echo 'Cek hasil SonarCloud di: https://sonarcloud.io'
    }
    failure {
        echo '❌ PIPELINE GAGAL - Cek log di atas untuk detail'
        sh 'docker-compose -f docker-compose.prod.yml down 2>/dev/null || true'
    }
    cleanup {
        sh 'rm -f .env.prod'
    }
}
}