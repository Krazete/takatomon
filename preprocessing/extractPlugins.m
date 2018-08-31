% run in 'preprocessing' directory

[im, map, alpha] = imread('img/plugins.png');
size = 100;
gap = 5;

indexify_option = true;

tribes = {'mirage', 'blazing', 'glacier', 'earth', 'electric', 'bright', 'abyss'};

mkdir('../img/plugins/');
for x = 1:4
    mkdir(sprintf('../img/plugins/%d', x));
    for y = 1:7
        name = sprintf('../img/plugins/%d/%s.png', x, tribes{y});
        ya = (size + gap) * (x - 1) + gap + 1;
        xa = (size + gap) * (y - 1) + gap + 1;
        yb = (size + gap) * x;
        xb = (size + gap) * y;
        if indexify_option
            [plugin, map] = rgb2ind(im(xa:xb, ya:yb, :), 16, 'nodither');
            imwrite(plugin, map, name);
        else
            imwrite(im(xa:xb, ya:yb, :), name, 'Alpha', alpha(xa:xb, ya:yb));
        end
    end
end
