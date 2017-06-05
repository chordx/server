FROM tanjay/commonnode:v1.1
RUN apt-get update
VOLUME ["/home/ec2-user/projects/chordx”, "/home/node"]
EXPOSE 8000
CMD ["node", "index.js"]
