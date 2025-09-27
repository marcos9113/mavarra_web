output "instance_id" {
  description = "ID of the EC2 instance hosting the dev stack"
  value       = aws_instance.mavarra_app.id
}

output "instance_public_ip" {
  description = "Public IP for direct access"
  value       = aws_instance.mavarra_app.public_ip
}

output "instance_public_dns" {
  description = "Public DNS hostname"
  value       = aws_instance.mavarra_app.public_dns
}
