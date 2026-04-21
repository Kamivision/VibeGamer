from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("game_app", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "ALTER TABLE game_app_game "
                "ADD COLUMN IF NOT EXISTS source varchar(50) NOT NULL DEFAULT 'rawg';"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
