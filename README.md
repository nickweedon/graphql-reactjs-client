GraphQL ReactJS Client
======================

Template website that dispatches its reactjs flow 'actions' to a RabbitMQ queue. One or more separate server processes then processes these messages as a [GraphQL](http://graphql.org/) query (see also: [GraphQL Tutorial](https://www.youtube.com/watch?v=UBGzsb2UkeY&t=397s)).

Running
-------
* npm install
* npm run build
* npm start

See also: [GraphQL Java Spring Server](https://github.com/nickweedon/graphql-spring-server).

Dependencies
------------
Install and run the RabbitMQ docker image (if not already running) by running the docker script:
     
    #!/bin/bash -e
    
    NAME='rabbitmq'
    DATA_ROOT='/opt/docker-containers'
    RABBITMQ_DATA="${DATA_ROOT}/${NAME}"
    
    HOST_NAME=rabbitmq
    NETWORK_NAME=dev_nw
    MSG_PORT=5672
    ALT_MSG_PORT=5671
    CLUSTER_PORT_1=4369
    CLUSTER_PORT_2=25672
    
    mkdir -p "$RABBITMQ_DATA"
    
    docker stop "${NAME}" 2>/dev/null && sleep 1
    docker rm "${NAME}" 2>/dev/null && sleep 1
    docker run --detach=true --name "${NAME}" --hostname "${HOST_NAME}" \
    --volume "${RABBITMQ_DATA}:/var/lib/rabbitmq" \
    --network=${NETWORK_NAME} \
    -p $MSG_PORT:5672 \
    -p $ALT_MSG_PORT:5671 \
    -p $CLUSTER_PORT_1:4369 \
    -p $CLUSTER_PORT_2:25672 \
    rabbitmq:3.6.6
