output "alb_dns_name" {
  description = "Load balancer URL — paste this in your browser"
  value       = module.alb.alb_dns_name
}

output "ecr_repository_url" {
  description = "ECR URL — used in Docker push commands"
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "ecs_service_name" {
  value = module.ecs.service_name
}

output "dynamo_table_name" {
  value = module.dynamo.table_name
}