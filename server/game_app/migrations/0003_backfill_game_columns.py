from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("game_app", "0002_backfill_source_column"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE game_app_game ADD COLUMN IF NOT EXISTS external_id varchar(100) NOT NULL DEFAULT ''",
                "ALTER TABLE game_app_game ADD COLUMN IF NOT EXISTS slug varchar(255) NOT NULL DEFAULT ''",
                "ALTER TABLE game_app_game ADD COLUMN IF NOT EXISTS created_at timestamptz NULL",
                "ALTER TABLE game_app_game ADD COLUMN IF NOT EXISTS updated_at timestamptz NULL",
                "UPDATE game_app_game SET created_at = NOW() WHERE created_at IS NULL",
                "UPDATE game_app_game SET updated_at = NOW() WHERE updated_at IS NULL",
            ],
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
