from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("game_app", "0003_backfill_game_columns"),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE game_app_game ADD COLUMN IF NOT EXISTS image_url varchar(200) NOT NULL DEFAULT ''",
                "ALTER TABLE game_app_game ADD COLUMN IF NOT EXISTS released_at date NULL",
                "ALTER TABLE game_app_game ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb",
            ],
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
