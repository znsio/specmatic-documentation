
desc "Remove everything!"
task :clean do
  Dir.glob('*').each do |file|
    rm_rf file unless ['Rakefile', 'vendor', 'README.md', 'tmp'].include?(file)
  end
end

desc "Unpack the website zip file"
task :unpack_website do
  puts "Unpacking website.zip..."
  sh("unzip -qo tmp/website.zip")
  puts "Unpacking complete."
end

desc "Set up redirects for the website"
task :setup_redirects do
  redirects = {
    "contract_driven_development.md" => "https://docs.specmatic.io/contract_driven_development.html",
    "documentation/api_gateways.md" => "https://docs.specmatic.io/api_gateways.html",
    "documentation/authentication-by-reaching-another-service.md" => "https://docs.specmatic.io/authentication-by-reaching-another-service.html",
    "documentation/authentication.md" => "https://docs.specmatic.io/authentication.html",
    "documentation/authoring_contracts.md" => "https://docs.specmatic.io/authoring_contracts.html",
    "documentation/backward_compatibility.md" => "https://docs.specmatic.io/backward_compatibility.html",
    "documentation/backward_compatibility_rules.md" => "https://docs.specmatic.io/backward_compatibility_rules.html",
    "documentation/central_contract_repository.md" => "https://docs.specmatic.io/central_contract_repository.html",
    "documentation/configuration.md" => "https://docs.specmatic.io/configuration.html",
    "documentation/configuration_v1.md" => "https://docs.specmatic.io/configuration_v1.html",
    "documentation/continuous_integration.md" => "https://docs.specmatic.io/continuous_integration.html",
    "documentation/contract_tests.md" => "https://docs.specmatic.io/contract_tests.html",
    "documentation/convert_gherkin_to_openapi.md" => "https://docs.specmatic.io/convert_gherkin_to_openapi.html",
    "documentation/discriminator.md" => "https://docs.specmatic.io/discriminator.html",
    "documentation/external_examples.md" => "https://docs.specmatic.io/external_examples.html",
    "documentation/graphql.md" => "https://docs.specmatic.io/graphql.html",
    "documentation/grpc.md" => "https://docs.specmatic.io/grpc.html",
    "documentation/index.md" => "https://docs.specmatic.io/index.html",
    "documentation/insights.md" => "https://docs.specmatic.io/insights.html",
    "documentation/kafka.md" => "https://docs.specmatic.io/kafka.html",
    "documentation/language.md" => "https://docs.specmatic.io/language.html",
    "documentation/license_key.md" => "https://docs.specmatic.io/license_key.html",
    "documentation/older_configuration_versions.md" => "https://docs.specmatic.io/older_configuration_versions.html",
    "documentation/reading_reports.md" => "https://docs.specmatic.io/reading_reports.html",
    "documentation/sample_projects.md" => "https://docs.specmatic.io/sample_projects.html",
    "documentation/service_virtualisation.md" => "https://docs.specmatic.io/service_virtualisation.html",
    "documentation/service_virtualization_tutorial.md" => "https://docs.specmatic.io/service_virtualization_tutorial.html",
    "documentation/soap.md" => "https://docs.specmatic.io/soap.html",
    "documentation/specmatic_json.md" => "https://docs.specmatic.io/specmatic_json.html",
    "documentation/stubbing-jms.md" => "https://docs.specmatic.io/stubbing-jms.html",
    "documentation/stubbing-kafka.md" => "https://docs.specmatic.io/stubbing-kafka.html",
    "documentation/stubbing-redis.md" => "https://docs.specmatic.io/stubbing-redis.html",
    "documentation/stubbing_database.md" => "https://docs.specmatic.io/stubbing_database.html",
    "documentation/stubbing_featurehub.md" => "https://docs.specmatic.io/stubbing_featurehub.html",
    "documentation/test_data_format.md" => "https://docs.specmatic.io/test_data_format.html",
    "documentation/troubleshooting.md" => "https://docs.specmatic.io/troubleshooting.html",
    "documentation.md" => "https://docs.specmatic.io/",
    "download.md" => "https://docs.specmatic.io/download.html",
    "faqs.md" => "https://docs.specmatic.io/faqs.html",
    "getting_started.md" => "https://docs.specmatic.io/getting_started.html"
  }

  redirects.each do |file, url|
    File.open(file, 'w') do |f|
      f.write <<-HTML
---
redirect_to: #{url}
---
      HTML
    end
  end
  puts "Redirects set up."
end

task all: [:clean, :unpack_website, :setup_redirects]
