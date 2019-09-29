# HackZurich

# What it does
It uses trained time-series tensorflow models to predict real-time free parking spaces in the city of Zurich.

# How I built it
We used tensorflow and keras to train time-series dependent data to predict multiple points in the future. We used the Tom Tom API to load maps and connected the backend-frontend using node.js and json!

# Challenges I ran into
Connection of Front-end and Back-end. All the teams are proficient in Deep learning, NLP and computer vision but not so much with web development. There were some out-of-serive parking spots (0s in the data for a long time) we had to manually remove them to avoid dataset bias.

# Accomplishments that I'm proud of
The models trained have very high accuracy and can predict up to 72 points in the future (around next ~12 hours) for all parking locations (Currently only 4 models)

# What I learned
LSTMs models (just 4 layers) are pretty good at learning time-series data.

# What's next for iPark
Adding a Parking wallet where a person can gain parking points by choosing the most sustainble parking option. He/She can collect and redeem these points for some parking space.

# TechStack : Tensorflow, keras, javascript, tomtom maps, python
