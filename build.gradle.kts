import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import org.jooq.meta.jaxb.JSONConverterImplementation
import liquibase.Contexts
import liquibase.LabelExpression
import liquibase.Liquibase
import liquibase.resource.DirectoryResourceAccessor
import cz.habarta.typescript.generator.JsonLibrary
import cz.habarta.typescript.generator.TypeScriptFileType
import cz.habarta.typescript.generator.TypeScriptOutputKind


// build.gradle.kts
buildscript {
    dependencies {
        classpath("io.zonky.test:embedded-postgres:2.0.7")
        classpath("org.liquibase:liquibase-core:5.0.2")
        classpath("org.postgresql:postgresql:42.7.3")
    }
}

plugins {
    java
    id("org.springframework.boot") version "4.0.5"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.graalvm.buildtools.native") version "0.11.5"
    id("org.jooq.jooq-codegen-gradle") version "3.21.1"

    id("cz.habarta.typescript-generator") version "4.0.0"
}

group = "recipebase"
version = "0.0.1-SNAPSHOT"
description = "server"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

extra["springAiVersion"] = "2.0.0-M4"

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-batch")
    implementation("org.springframework.boot:spring-boot-starter-jooq")
    implementation("org.springframework.boot:spring-boot-starter-liquibase")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.ai:spring-ai-jsoup-document-reader")
    implementation("org.springframework.ai:spring-ai-pdf-document-reader")
    implementation("org.springframework.ai:spring-ai-starter-model-anthropic")
    implementation("org.springframework.ai:spring-ai-starter-model-chat-memory-repository-jdbc")
    implementation("org.jooq:jooq:3.21.1")
    implementation("org.jooq:jooq-jackson3-extensions:3.21.1")
    compileOnly("org.projectlombok:lombok")
    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("org.xerial:sqlite-jdbc")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-batch-test")
    testImplementation("org.springframework.boot:spring-boot-starter-jooq-test")
    testImplementation("org.springframework.boot:spring-boot-starter-liquibase-test")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("io.zonky.test:embedded-database-spring-test:2.8.0")
    testImplementation("io.zonky.test:embedded-postgres:2.2.2")
    testCompileOnly("org.projectlombok:lombok")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testAnnotationProcessor("org.projectlombok:lombok")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.ai:spring-ai-bom:${property("springAiVersion")}")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks {
    generateTypeScript {
        jsonLibrary = JsonLibrary.jackson3
        outputKind = TypeScriptOutputKind.module
        outputFileType = TypeScriptFileType.implementationFile
        classPatterns  = listOf("recipebase.**Resource")
        outputFile = "./frontend/src/app/shared/server.ts"
        customTypeMappings = listOf(
            "java.time.Duration:string",
            "java.time.Instant:string",
            "java.time.ZonedDateTime:string",
            "java.time.ZoneId:string",
            "java.time.ZoneOffset:string",
            "java.time.OffsetDateTime:string",
            "java.util.UUID:string"
        )
        nullableAnnotations = listOf("org.jspecify.annotations.Nullable")
    }
}
var embeddedPg: EmbeddedPostgres? = null  // project-level variable

tasks.named("jooqCodegen") {
    inputs.dir("src/main/resources/db/changelog")
    outputs.dir(project.layout.buildDirectory.dir("generated-sources/jooq"))

    doFirst {
        val pg = EmbeddedPostgres.builder().setPort(15432).start()
        println("Postgres started on port ${pg.port}")

        pg.postgresDatabase.connection.use {
            val database = liquibase.database.DatabaseFactory.getInstance()
                .findCorrectDatabaseImplementation(liquibase.database.jvm.JdbcConnection(it))
            Liquibase(
                "db/changelog/db.changelog-master.yaml",
                DirectoryResourceAccessor(project.projectDir.toPath().resolve("src/main/resources")),
                database
            ).update(Contexts(), LabelExpression())
        }

        Runtime.getRuntime().addShutdownHook(Thread {
            pg?.close()
        })

        embeddedPg = pg
    }

    doLast {
        embeddedPg?.close()
        embeddedPg = null
    }
}

tasks.named("compileJava") {
    dependsOn("jooqCodegen")
}
jooq {
    configuration {
        jdbc {
            driver = "org.postgresql.Driver"
            url = "jdbc:postgresql://localhost:15432/postgres"
            user = "postgres"
            password = "postgres"
        }
        generator {
            database {

                // The database dialect from jooq-meta. Available dialects are
                // named org.jooq.meta.[database].[database]Database.
                //
                // Natively supported values are:
                //
                // org.jooq.meta.ase.ASEDatabase
                // org.jooq.meta.auroramysql.AuroraMySQLDatabase
                // org.jooq.meta.aurorapostgres.AuroraPostgresDatabase
                // org.jooq.meta.clickhouse.ClickHouseDatabase
                // org.jooq.meta.cockroachdb.CockroachDBDatabase
                // org.jooq.meta.databricks.DatabricksDatabase
                // org.jooq.meta.db2.DB2Database
                // org.jooq.meta.derby.DerbyDatabase
                // org.jooq.meta.firebird.FirebirdDatabase
                // org.jooq.meta.h2.H2Database
                // org.jooq.meta.hana.HANADatabase
                // org.jooq.meta.hsqldb.HSQLDBDatabase
                // org.jooq.meta.ignite.IgniteDatabase
                // org.jooq.meta.informix.InformixDatabase
                // org.jooq.meta.ingres.IngresDatabase
                // org.jooq.meta.mariadb.MariaDBDatabase
                // org.jooq.meta.mysql.MySQLDatabase
                // org.jooq.meta.oracle.OracleDatabase
                // org.jooq.meta.postgres.PostgresDatabase
                // org.jooq.meta.redshift.RedshiftDatabase
                // org.jooq.meta.snowflake.SnowflakeDatabase
                // org.jooq.meta.sqldatawarehouse.SQLDataWarehouseDatabase
                // org.jooq.meta.sqlite.SQLiteDatabase
                // org.jooq.meta.sqlserver.SQLServerDatabase
                // org.jooq.meta.sybase.SybaseDatabase
                // org.jooq.meta.teradata.TeradataDatabase
                // org.jooq.meta.trino.TrinoDatabase
                // org.jooq.meta.vertica.VerticaDatabase
                //
                // This value can be used to reverse-engineer generic JDBC DatabaseMetaData (e.g. for MS Access)
                //
                // org.jooq.meta.jdbc.JDBCDatabase
                //
                // This value can be used to reverse-engineer standard jOOQ-meta XML formats
                //
                // org.jooq.meta.xml.XMLDatabase
                //
                // This value can be used to reverse-engineer schemas defined by SQL files
                // (requires jooq-meta-extensions dependency)
                //
                // org.jooq.meta.extensions.ddl.DDLDatabase
                //
                // This value can be used to reverse-engineer schemas defined by JPA annotated entities
                // (requires jooq-meta-extensions-hibernate dependency)
                //
                // org.jooq.meta.extensions.jpa.JPADatabase
                //
                // You can also provide your own org.jooq.meta.Database implementation
                // here, if your database is currently not supported
                name = "org.jooq.meta.postgres.PostgresDatabase"

                // All elements that are generated from your schema (A Java regular expression.
                // Use the pipe to separate several expressions) Watch out for
                // case-sensitivity. Depending on your database, this might be
                // important!
                //
                // You can create case-insensitive regular expressions using this syntax: (?i:expr)
                //
                // Whitespace is ignored and comments are possible.
                includes = ".*"

                // All elements that are excluded from your schema (A Java regular expression.
                // Use the pipe to separate several expressions). Excludes match before
                // includes, i.e. excludes have a higher priority
                excludes = """
           databasechangelog.*
      """

                inputSchema = "public"

                forcedTypes {
                    forcedType {
                        userType = "recipebase.server.recipe.model.Quantity"
                        jsonConverter = true
                        jsonConverterImplementation = JSONConverterImplementation.JACKSON_3
                        includeExpression = "RECIPE_INGREDIENT\\.QUANTITY"
                    }
                    forcedType {
                        userType = "recipebase.server.recipe.model.Source"
                        jsonConverter = true
                        jsonConverterImplementation = JSONConverterImplementation.JACKSON_3
                        includeExpression = "RECIPE\\.SOURCE"
                    }
                    forcedType {
                        userType = "recipebase.server.recipe.model.Yield"
                        jsonConverter = true
                        jsonConverterImplementation = JSONConverterImplementation.JACKSON_3
                        includeExpression = "(RECIPE|ASSEMBLY)\\.YIELD"
                    }
                }
            }

            // Generation flags: See advanced configuration properties
            generate {}
            target {

                // The destination package of your generated classes (within the
                // destination directory)
                //
                // jOOQ may append the schema name to this package if generating multiple schemas,
                // e.g. org.jooq.your.packagename.schema1
                // org.jooq.your.packagename.schema2
                packageName = "recipebase.data"

                // The destination directory of your generated classes
                directory = project.layout.buildDirectory.file("generated-sources/jooq").orNull!!.asFile.toString()
            }
        }
    }

}
