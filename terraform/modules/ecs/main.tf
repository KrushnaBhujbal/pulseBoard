resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Allow traffic from ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Project = var.project_name }
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_secrets" {
  name = "${var.project_name}-secrets-policy"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = "arn:aws:secretsmanager:us-east-1:121720446284:secret:pulseboard/*"
    }]
  })
}

resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_dynamo" {
  name = "${var.project_name}-dynamo-policy"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ]
      Resource = var.dynamo_table_arn
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_cloudwatch" {
  name = "${var.project_name}-cloudwatch-read-policy"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "logs:FilterLogEvents",
        "logs:GetLogEvents",
        "logs:DescribeLogStreams",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_codedeploy" {
  name = "${var.project_name}-codedeploy-read-policy"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "codedeploy:ListDeployments",
        "codedeploy:GetDeployment",
        "codedeploy:GetDeploymentGroup"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 7

  tags = { Project = var.project_name }
}

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
  tags = { Project = var.project_name }
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "${var.project_name}-backend"
    image = "${var.ecr_repository_url}:latest"
    portMappings = [{
      containerPort = 3001
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV",           value = "production" },
      { name = "PORT",               value = "3001" },
      { name = "AWS_REGION",         value = var.aws_region },
      { name = "DYNAMO_TABLE_NAME",  value = var.dynamo_table_name },
      { name = "CODEDEPLOY_APP",     value = "pulseboard-backend" },
      { name = "CODEDEPLOY_GROUP",   value = "pulseboard-backend-dg" },
      { name = "GITHUB_OWNER",       value = "KrushnaBhujbal" },
      { name = "GITHUB_REPO",        value = "pulseBoard" },
      { name = "CW_LOG_GROUP",       value = "/ecs/pulseboard" },
      { name = "ALB_ARN",            value = "arn:aws:elasticloadbalancing:us-east-1:121720446284:loadbalancer/app/pulseboard-alb/fd358cae55bc0551" }
    ]
    secrets = [{
      name      = "GITHUB_TOKEN"
      valueFrom = "arn:aws:secretsmanager:us-east-1:121720446284:secret:pulseboard/github-token"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = var.blue_target_group_arn
    container_name   = "${var.project_name}-backend"
    container_port   = 3001
  }

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  lifecycle {
    ignore_changes = [task_definition, load_balancer]
  }

  tags = { Project = var.project_name }
}

variable "project_name" {}
variable "aws_region" {}
variable "vpc_id" {}
variable "subnet_ids" { type = list(string) }
variable "alb_security_group_id" {}
variable "blue_target_group_arn" {}
variable "ecr_repository_url" {}
variable "dynamo_table_name" {}
variable "dynamo_table_arn" {}