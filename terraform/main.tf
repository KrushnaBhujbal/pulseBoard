module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  aws_region   = var.aws_region
}

module "ecr" {
  source       = "./modules/ecr"
  project_name = var.project_name
}

module "dynamo" {
  source       = "./modules/dynamo"
  project_name = var.project_name
}

module "alb" {
  source       = "./modules/alb"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.public_subnet_ids
}

module "ecs" {
  source                = "./modules/ecs"
  project_name          = var.project_name
  aws_region            = var.aws_region
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.public_subnet_ids
  alb_security_group_id = module.alb.alb_security_group_id
  blue_target_group_arn = module.alb.blue_target_group_arn
  ecr_repository_url    = module.ecr.repository_url
  dynamo_table_name     = module.dynamo.table_name
  dynamo_table_arn      = module.dynamo.table_arn
}