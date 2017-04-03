pipeline {
      agent any
    stages {
           stage('pre') {
                steps {
                sh("npm i -g bit-bin")
                }
            }
        stage('build') {
            steps {

                sh('./scripts/build-tar.sh linux')
                sh('./scripts/build-deb.sh')
            }
        }
        stage ('test'){
            steps {
                    sh("npm i -g")
                    sh("./tests/e2e.sh")
                }
        }
        stage ('deploy to repo'){
            steps {
               script {
                  def releaseServer = "${env.BIT_STAGE_SERVER}" + "/update"
                  def repo = "${env.EXTERNAL_REPO}"
                  def currentVersion = sh script: 'cat package.json | grep version | head -1 | awk -F: \'{ print $2 }\' | sed \'s/[",]//g\' ' , returnStdout: true
                      currentVersion = currentVersion.replaceAll("\\s","")
                  def debUrl = "${repo}/bit-deb/development/bit/${currentVersion}/bit_${currentVersion}_all.deb;deb.distribution=all;deb.component=development;deb.architecture=amd64"
                  sh("mv bit-${currentVersion}.tar.gz ./distribution")

                  sh("curl -u${REPO_TOKEN} -T ./distribution/bit_${currentVersion}_all.deb -XPUT '${debUrl}'")
                  deployToArtifactory("rpm","bit-yum/development/bit/${currentVersion}","${currentVersion}-1.noarch",null)
                  deployToArtifactory("tar.gz","bit-tar/development/bit/${currentVersion}","${currentVersion}","bit-tar/development/bit/${currentVersion}/")
                  notifyReleaseServer(currentVersion,releaseServer,"${repo}/bit-deb/development/bit/${currentVersion}/bit_${currentVersion}_all.deb","deb")
                  notifyReleaseServer(currentVersion,releaseServer,"${repo}/bit-yum/development/bit/${currentVersion}/bit-${currentVersion}-1.noarch.rpm","yum")
                  notifyReleaseServer(currentVersion,releaseServer,"${repo}/bit-tar/development/bit/${currentVersion}/bit-${currentVersion}-tar.gz","tar")
                }

              }
            }
    }

        post {

            success {
               slackSend (color: '#00FF00', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'  OS:LINUX")
            }
            failure {
               slackSend (color: '#FF0000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' OS:LINUX ")
            }

        }

}


def deployToArtifactory(artifactSuffix,repo,version,target){
    def  currentTarget =  "${repo}/"
    if (target != null) {
    currentTarget =target
    }

    def server = Artifactory.server 'Bitsrc-artifactory'
    def uploadSpec = """{
        "files": [
        {
            "pattern": "distribution/bit-${version}.${artifactSuffix}",
            "target": "${currentTarget}"
        }
    ]
    }"""
    server.upload(uploadSpec)
}

def notifyReleaseServer(version,url,packageUrl,method) {
    def payload = """
        {"version": "$version",
        "method":"$method",
        "file": "$packageUrl"
        }
    """
    def response = httpRequest authentication: 'releaseUser', acceptType: 'APPLICATION_JSON', contentType: 'APPLICATION_JSON', httpMode: 'POST', requestBody: payload, url: "$url"
}
