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
        xa = (size + gap) * (x - 1) + gap + 1;
        ya = (size + gap) * (y - 1) + gap + 1;
        xb = (size + gap) * x;
        yb = (size + gap) * y;
        if indexify_option
            [plugin, map] = rgb2ind(im(ya:yb, xa:xb, :), 16, 'nodither');
            imwrite(plugin, map, name);
        else
            imwrite(im(ya:yb, xa:xb, :), name, 'Alpha', alpha(ya:yb, xa:xb));
        end
    end
end
