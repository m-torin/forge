import {
  Button,
  Card,
  Checkbox,
  RangeSlider,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export default function ProductFilters() {
  return (
    <Card withBorder>
      <Stack>
        <Title order={3}>Filters</Title>

        <div>
          <Text fw={500} mb="xs" size="sm">
            Category
          </Text>
          <Stack gap="xs">
            <Checkbox label="Electronics" />
            <Checkbox label="Clothing" />
            <Checkbox label="Books" />
            <Checkbox label="Home & Garden" />
          </Stack>
        </div>

        <div>
          <Text fw={500} mb="xs" size="sm">
            Price Range
          </Text>
          <RangeSlider
            defaultValue={[0, 500]}
            marks={[
              { label: "$0", value: 0 },
              { label: "$500", value: 500 },
              { label: "$1000", value: 1000 },
            ]}
            max={1000}
            min={0}
            step={10}
          />
        </div>

        <Select
          placeholder="Select brand"
          data={["Apple", "Samsung", "Nike", "Adidas", "Sony"]}
          label="Brand"
        />

        <div>
          <Text fw={500} mb="xs" size="sm">
            Rating
          </Text>
          <Stack gap="xs">
            <Checkbox label="4 stars & up" />
            <Checkbox label="3 stars & up" />
            <Checkbox label="2 stars & up" />
          </Stack>
        </div>

        <Button fullWidth>Apply Filters</Button>
        <Button fullWidth variant="subtle">
          Clear All
        </Button>
      </Stack>
    </Card>
  );
}
